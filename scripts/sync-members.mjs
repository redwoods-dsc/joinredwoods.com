// ─── Pulls the Redwoods member list out of Slack ─────────────────────────────
//
// Run this, don't call it from the build: the site is static and a build that
// depends on Slack being up, and on a secret being present, is a build that
// fails for reasons nobody can see in the repo. The output is committed.
//
//   node --env-file=.env scripts/sync-members.mjs
//
// Writes src/data/members.json and src/assets/members/*.jpg.

import { mkdir, readFile, writeFile, readdir, unlink } from 'node:fs/promises';
import { join } from 'node:path';

const TOKEN = process.env.SLACK_TOKEN;
if (!TOKEN) {
  console.error('SLACK_TOKEN is not set. Put it in .env — see the members section of CLAUDE.md.');
  process.exit(1);
}

/* Custom profile fields come back keyed by an opaque id rather than the label
   you typed into Slack. `node --env-file=.env scripts/sync-members.mjs --fields`
   prints the current mapping if these ever stop matching. */
const FIELD = {
  optIn: 'Xf0B01T21M5X', // "Can we list you on the Redwoods website?"
  links: ['Xf0B01T1T073', 'Xf0AV30JT2RY', 'Xf0AUZHXUM6H', 'Xf0B0H8J5Z7A', 'Xf0AUMGKT7UP'],
};
const YES = 'Yes, please!';

const DATA = 'src/data/members.json';
const AVATARS = 'src/assets/members';
/* A token that has expired, or a field id that has drifted, both look like
   "nobody opted in" — which would quietly unpublish every member. Refuse the
   write instead, unless someone says out loud that the drop is real. */
const MAX_SHRINK = 3;
const EXT = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
};

const api = async (method, params = '') => {
  const res = await fetch(`https://slack.com/api/${method}${params}`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  });
  const body = await res.json();
  if (!body.ok)
    throw new Error(`${method}: ${body.error}${body.needed ? ` (needs ${body.needed})` : ''}`);
  return body;
};

if (process.argv.includes('--fields')) {
  const { profile } = await api('team.profile.get');
  for (const f of profile.fields) {
    console.log(
      `${f.id}  ${f.type.padEnd(13)}  ${f.label}${f.possible_values ? `  [${f.possible_values.join(' | ')}]` : ''}`,
    );
  }
  process.exit(0);
}

/* Close to authorSlug in src/lib/authors.ts, so a member and an article author
   with the same name land on the same slug when bylines name individuals — but
   stricter, because this also becomes a filename. A real member is called
   "Brittany Clark (Hogg)", and unescaped parentheses belong in neither. */
const slugify = (name) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

// Five profile fields all say "Link" and nothing tells them apart, so the host
// is the only signal for what a URL is.
const isLinkedIn = (url) => {
  try {
    return new URL(url).hostname.replace(/^www\./, '').endsWith('linkedin.com');
  } catch {
    return false;
  }
};

/* Sorted on, not displayed. A trailing "(Hogg)" is an alternate surname rather
   than the one to file under, and it would otherwise sort ahead of the letters. */
/* Slack only sets is_custom_image for a direct upload. Where there is none it
   falls back to Gravatar and hands back a URL with `d=` pointing at one of its
   own default avatars — so the URL always resolves and the flag alone would
   drop everyone whose picture reaches Slack through Gravatar, which is what
   they see in Slack and reasonably expect here. Ask Gravatar to 404 instead of
   falling back, and the answer says whether a real photo exists. */
const photoUrl = async (profile) => {
  const url = profile.image_192;
  if (!url) return undefined;
  if (!new URL(url).hostname.endsWith('gravatar.com')) return url;
  const strict = `${url.split('?')[0]}?s=192&d=404`;
  const res = await fetch(strict, { method: 'HEAD', redirect: 'manual' });
  return res.status === 200 ? strict : undefined;
};

const surname = (name) =>
  name
    .replace(/\([^)]*\)/g, ' ')
    .trim()
    .split(/\s+/)
    .at(-1) ?? name;

console.log('Reading the workspace…');
const accounts = [];
let cursor = '';
do {
  const body = await api('users.list', `?limit=200&cursor=${cursor}`);
  accounts.push(...body.members);
  cursor = body.response_metadata?.next_cursor ?? '';
} while (cursor);

const humans = accounts.filter(
  (m) => !m.is_bot && !m.deleted && !m.is_restricted && m.id !== 'USLACKBOT',
);
console.log(`  ${humans.length} active members`);

const members = [];
for (const account of humans) {
  const { profile } = await api('users.profile.get', `?user=${account.id}`);
  const field = (id) => profile.fields?.[id]?.value?.trim() ?? '';
  if (field(FIELD.optIn) !== YES) continue;

  const name = (profile.real_name ?? '').trim();
  if (!name) continue;

  const urls = FIELD.links.map(field).filter(Boolean);
  members.push({
    slug: slugify(name),
    name,
    title: (profile.title ?? '').trim() || undefined,
    linkedin: urls.find(isLinkedIn),
    website: urls.find((u) => !isLinkedIn(u)),
    avatarHash: profile.avatar_hash,
    avatarUrl: await photoUrl(profile),
  });
  await new Promise((r) => setTimeout(r, 250));
}

const collator = new Intl.Collator('en', { sensitivity: 'base' });
members.sort(
  (a, b) => collator.compare(surname(a.name), surname(b.name)) || collator.compare(a.name, b.name),
);

const seen = new Map();
for (const m of members) {
  const n = (seen.get(m.slug) ?? 0) + 1;
  seen.set(m.slug, n);
  if (n > 1) m.slug = `${m.slug}-${n}`;
}

const previous = JSON.parse(await readFile(DATA, 'utf8').catch(() => '[]'));
const shrink = previous.length - members.length;
if (shrink > MAX_SHRINK && !process.argv.includes('--force')) {
  console.error(`\nRefusing to write: ${previous.length} members became ${members.length}.`);
  console.error('That is usually a bad token or a changed field id, not people leaving.');
  console.error('Pass --force if the drop is real.');
  process.exit(1);
}

await mkdir(AVATARS, { recursive: true });
const byHash = new Map(previous.map((m) => [m.slug, m.avatarHash]));
const byFile = new Map(previous.map((m) => [m.slug, m.avatar]));
let fetched = 0;
for (const m of members) {
  if (!m.avatarUrl) continue;
  // Slack changes avatar_hash when the photo changes, so an unchanged one means
  // the bytes on disk are already right — a weekly job that re-downloaded every
  // avatar would commit near-identical binaries forever.
  const unchanged = byHash.get(m.slug) === m.avatarHash && byHash.get(m.slug);
  if (unchanged) {
    m.avatar = byFile.get(m.slug);
    continue;
  }
  const res = await fetch(m.avatarUrl);
  if (!res.ok) {
    console.warn(`  could not fetch an avatar for ${m.slug} (${res.status})`);
    delete m.avatar;
    continue;
  }
  /* From the response, never from the URL. Slack serves whatever the member
     uploaded and about a third are PNGs; Gravatar serves PNG from a path ending
     .jpg. An extension that disagrees with the bytes fails Astro's image
     endpoint outright, so guessing it is not an option. */
  const ext = EXT[res.headers.get('content-type')?.split(';')[0].trim()];
  if (!ext) {
    console.warn(`  unexpected image type for ${m.slug}: ${res.headers.get('content-type')}`);
    delete m.avatar;
    continue;
  }
  m.avatar = `${m.slug}.${ext}`;
  await writeFile(join(AVATARS, m.avatar), Buffer.from(await res.arrayBuffer()));
  fetched++;
}

const wanted = new Set(members.map((m) => m.avatar).filter(Boolean));
let removed = 0;
for (const file of await readdir(AVATARS).catch(() => [])) {
  if (/\.(jpg|png|gif|webp)$/.test(file) && !wanted.has(file)) {
    await unlink(join(AVATARS, file));
    removed++;
  }
}

const rows = members.map(({ avatarUrl, ...keep }) => keep);
await writeFile(DATA, `${JSON.stringify(rows, null, 2)}\n`);

console.log(`\n  ${members.length} listed  (was ${previous.length})`);
console.log(`  ${fetched} avatar(s) downloaded, ${removed} removed`);
console.log(`  wrote ${DATA}`);
