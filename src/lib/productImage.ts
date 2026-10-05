import { supabase } from './supabase';

// =============================================================
// Product photographs.
//
// The product-images bucket is public, so a path resolves to a plain URL with
// no token and no round trip — it works in an <img>, in an email and on the
// marketing site. That is only acceptable under one rule, which is also
// written into the migration:
//
//   PHOTOGRAPH THE OBJECT, NEVER THE CHILDREN USING IT.
//
// A learner in frame in a public bucket is a data-protection incident. If we
// ever want session photographs they need their own bucket and their own
// rules.
// =============================================================

export const PRODUCT_IMAGE_BUCKET = 'product-images';

/** Public URL for a stored path, or null when there is no photograph yet. */
export function productImageUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  const { data } = supabase.storage.from(PRODUCT_IMAGE_BUCKET).getPublicUrl(path);
  return data?.publicUrl ?? null;
}

export const MAX_PRODUCT_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED = ['image/png', 'image/jpeg', 'image/webp'];

/**
 * Upload a photograph for a product and return its stored path.
 *
 * Keyed by product id so a product's images stay together and a re-upload is
 * easy to find. The original extension is kept because the bucket only accepts
 * three types anyway, and upsert is off so an accidental double-submit cannot
 * silently overwrite a different file.
 */
export async function uploadProductImage(
  productId: string,
  file: File,
): Promise<{ path: string | null; error: string | null }> {
  if (!ALLOWED.includes(file.type)) {
    return { path: null, error: 'Use a PNG, JPEG or WebP image.' };
  }
  if (file.size > MAX_PRODUCT_IMAGE_BYTES) {
    return { path: null, error: 'That image is over 5 MB. Please use a smaller one.' };
  }
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const path = `${productId}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage
    .from(PRODUCT_IMAGE_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) return { path: null, error: error.message };
  return { path, error: null };
}

/** Best effort. A stale object costs a few kilobytes; a failed delete must not
 *  stop the product row being saved. */
export async function removeProductImage(path: string | null | undefined): Promise<void> {
  if (!path) return;
  await supabase.storage.from(PRODUCT_IMAGE_BUCKET).remove([path]);
}
