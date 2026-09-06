import { ImagePlus } from 'lucide-react';
import { productImageUrl } from '../../lib/productImage';

/**
 * A product photograph, or a clear placeholder when there is not one yet.
 *
 * Shared because a teacher choosing what to order and an admin curating the
 * catalogue should be looking at the same picture of the same object. The
 * placeholder is deliberately obvious rather than a broken image, since a
 * catalogue with no photographs is the state we are climbing out of.
 *
 * `preview` is a local object URL while a file is chosen but not yet uploaded,
 * so a form shows what is about to be saved rather than what is stored.
 */
export function ProductThumb({
  path, name, preview, size = 40,
}: {
  path: string | null | undefined;
  name?: string;
  preview?: string | null;
  size?: number;
}) {
  const src = preview ?? productImageUrl(path);
  const box = { width: size, height: size };

  if (!src) {
    return (
      <div
        style={box}
        className="flex-shrink-0 rounded-md bg-warm-100 border border-warm-200 flex items-center justify-center"
        title="No photograph yet"
      >
        <ImagePlus className="h-4 w-4 text-gray-400" aria-hidden="true" />
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
