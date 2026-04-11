import type { MediaAsset } from '../types/cms';

export const getMediaUrl = (asset?: string | MediaAsset | null) => {
  if (!asset) return undefined;
  if (typeof asset === 'string') return asset;
  return asset.url;
};

export const formatDate = (dateString?: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return dateString;
  }
  return date.toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};
