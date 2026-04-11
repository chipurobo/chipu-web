export interface MediaAsset {
  url?: string;
  filename?: string;
}

export interface CmsTeamMember {
  id: string;
  name: string;
  slug: string;
  role: string;
  bio: string;
  order?: number | null;
  photo?: string | MediaAsset | null;
  social?: {
    linkedin?: string;
    github?: string;
    email?: string;
  } | null;
}

export interface CmsBlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author?: string;
  publishedOn?: string;
  category?: string;
  featuredImage?: string | MediaAsset | null;
}

export interface CmsSiteSettings {
  hero?: {
    eyebrow?: string;
    title?: string;
    highlight?: string;
    description?: string;
    ctaLabel?: string;
    ctaHref?: string;
  } | null;
  stats?: Array<{
    label: string;
    value: string;
    description?: string;
  }> | null;
}

export interface CollectionResponse<T> {
  docs: T[];
}
