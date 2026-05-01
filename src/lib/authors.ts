export function authorSlug(name: string) {
  return name.toLowerCase().replace(/\s+/g, '-');
}
