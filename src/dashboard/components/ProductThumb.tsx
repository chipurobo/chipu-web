import { productImageUrl } from '../../lib/productImage';

/**
 * A product photograph, or a generated placeholder when there is not one yet.
 *
 * Shared, because a teacher choosing what to order and an admin curating the
 * catalogue should be looking at the same picture of the same object.
 *
 * WHY THE PLACEHOLDER IS GENERATED RATHER THAN A STOCK IMAGE FILE.
 *
 * Every product needs to look like something, but uploading one grey box
 * against twenty products would be twenty identical files to store, and a
 * single shared stock photo would be worse: it reads as a photograph of the
 * object and it is not. This draws initials and a colour derived from the
 * product's own name, so every product is visually distinct, nothing has to be
 * uploaded, and it is obvious at a glance that no photograph exists yet.
 *
 * It disappears the moment a real photograph is added.
 */

/**
 * Stable hue from the name, so a product keeps its colour between renders.
 *
 * FNV-1a rather than a simple rolling sum: two names differing by one
 * character need to land far apart, not adjacent. "Anatomical Heart - 2D
 * panel" and "- 3D model" came out the same shade of purple with a weaker
 * mix, which is useless for exactly the pair that most needs telling apart.
 */
function hueFor(name: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < name.length; i++) {
    h ^= name.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h % 360;
}

/**
 * Up to three characters that actually distinguish one product from another.
 *
 * A token containing a digit is the most distinguishing thing in a name and
 * wins outright - "2D", "3D", "v2". Without one, the first letters of the
 * first two words. Plain initials alone would render both anatomical hearts
 * as "AH".
 */
function initialsFor(name: string): string {
  const words = name.trim().split(/[\s\-_]+/).filter(Boolean);
  if (words.length === 0) return '?';

  const marked = words.find((w) => /\d/.test(w) && w.length <= 4);
  if (marked) {
    const lead = words.find((w) => w !== marked && /[A-Za-z]/.test(w));
    return ((lead ? lead[0] : '') + marked).toUpperCase().slice(0, 4);
  }

  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

export function ProductThumb({
  path, name, preview, size = 40,
}: {
  path: string | null | undefined;
  name?: string | null;
  preview?: string | null;
  size?: number;
}) {
  const src = preview ?? productImageUrl(path);
  const box = { width: size, height: size };

  if (!src) {
    const label = name?.trim() || 'Unnamed product';
    const hue = hueFor(label);
    return (
      <div
        style={{
          ...box,
          background: `hsl(${hue} 42% 93%)`,
          color: `hsl(${hue} 45% 32%)`,
          borderColor: `hsl(${hue} 35% 82%)`,
          fontSize: Math.max(10, Math.round(size * 0.34)),
        }}
        className="flex-shrink-0 rounded-md border flex items-center justify-center font-semibold select-none"
        role="img"
        aria-label={`${label} — no photograph yet`}
        title={`${label} — no photograph yet`}
      >
        {initialsFor(label)}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name ? `Photograph of ${name}` : 'Product photograph'}
      style={box}
      loading="lazy"
      className="flex-shrink-0 rounded-md object-cover border border-warm-200 bg-white"
    />
  );
}
