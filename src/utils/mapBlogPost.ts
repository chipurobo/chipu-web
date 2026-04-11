import { Brain } from 'lucide-react';
import type { CmsBlogPost } from '../types/cms';
import type { BlogPostData } from '../data/blogPosts';
import { formatDate, getMediaUrl } from './cmsHelpers';

export const mapBlogPostFromCms = (post: CmsBlogPost): BlogPostData => ({
  id: post.slug || post.id,
  title: post.title,
  excerpt: post.excerpt,
  content: post.content,
  author: post.author || 'ChipuRobo Team',
  date: formatDate(post.publishedOn) || '—',
  readTime: '5 min read',
  image: getMediaUrl(post.featuredImage) || '/img/blog/inclusive.jpg',
  category: post.category || 'Update',
  icon: Brain,
});
