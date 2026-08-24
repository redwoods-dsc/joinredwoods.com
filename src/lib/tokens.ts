import tokensCss from '../styles/tokens.css?raw';

/**
 * Reads a colour token straight out of tokens.css, following `var()` hops
 * (`--color-accent` → `--color-orange` → `#95532d`) so the build fails loudly
 * rather than silently baking a stale colour into a generated image.
 */
export function colorToken(name: string): string {
  const declarations = new Map(
    Array.from(
      tokensCss.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g),
      (match) => [match[1], match[2].trim()] as const,
    ),
  );

  let value = declarations.get(name);
  for (let hops = 0; value !== undefined && hops < 4; hops++) {
    const reference = value.match(/^var\(\s*(--[\w-]+)\s*\)$/);
    if (!reference) return value;
    value = declarations.get(reference[1]);
  }

  throw new Error(`Could not resolve ${name} to a colour value in tokens.css`);
}
