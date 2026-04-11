import type { CmsBlogPost, CmsSiteSettings, CmsTeamMember, CollectionResponse } from '../types/cms';

const baseUrl = import.meta.env.VITE_CMS_URL?.replace(/\/$/, '') || '';
const apiKey = import.meta.env.VITE_CMS_API_KEY;

const headers: HeadersInit = apiKey
  ? {
      Authorization: `Bearer ${apiKey}`,
    }
  : {};

async function fetchFromCMS<T>(path: string): Promise<T | null> {
  if (!baseUrl) {
    return null;
  }

  try {
    const response = await fetch(`${baseUrl}/api${path}`, {
      headers,
    });

    if (!response.ok) {
      console.warn('CMS request failed', response.status, response.statusText);
      return null;
    }

    return (await response.json()) as T;
  } catch (error) {
    console.warn('Unable to reach CMS', error);
    return null;
  }
}

export async function fetchTeamMembers() {
  const data = await fetchFromCMS<CollectionResponse<CmsTeamMember>>(
    `/team-members?sort=order&limit=100&depth=1`
  );
  return data?.docs ?? [];
}

export async function fetchBlogPosts() {
  const data = await fetchFromCMS<CollectionResponse<CmsBlogPost>>(
    `/blog-posts?sort=-publishedOn&limit=100&depth=1`
  );
  return data?.docs ?? [];
}

export async function fetchBlogPostBySlug(slug: string) {
  const data = await fetchFromCMS<CollectionResponse<CmsBlogPost>>(
    `/blog-posts?where[slug][equals]=${encodeURIComponent(slug)}&depth=1`
  );
  return data?.docs?.[0] ?? null;
}

export async function fetchSiteSettings() {
  const data = await fetchFromCMS<CmsSiteSettings>('/globals/site-settings');
  return data;
}
