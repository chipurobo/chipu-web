import { useParams, Link } from 'react-router-dom';
import { Calendar, Clock, User, ArrowLeft } from 'lucide-react';
import { getBlogPostById } from '../data/blogPosts';

const BlogPost = () => {
 const { id } = useParams<{ id: string }>();
 const post = id ? getBlogPostById(id) : undefined;

 if (!post) {
 return (
 <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-28 text-center">
 <h1 className="heading-display text-3xl font-bold text-gray-900 mb-4">Post Not Found</h1>
 <p className="text-gray-600 mb-8">The blog post you're looking for doesn't exist.</p>
 <Link
 to="/blog"
 className="inline-flex items-center text-terracotta-600 hover:text-terracotta-700 font-medium transition-colors"
 >
 <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
 Back to Blog
 </Link>
 </div>
 );
 }

 return (
 <div className="section">
 <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
 <Link
 to="/blog"
 className="inline-flex items-center text-terracotta-600 hover:text-terracotta-700 mb-8 font-medium text-sm transition-colors"
 >
 <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
 Back to Blog
 </Link>

 <article className="bg-white rounded-xl shadow-soft-lg border border-gray-100 overflow-hidden">
 <div className="relative h-80 sm:h-96 overflow-hidden">
 <picture>
 <source srcSet={post.image.replace(/\.(jpe?g|png)$/i, '.webp')} type="image/webp" />
 <img
 src={post.image}
 alt={post.title}
 width={1200}
 height={674}
 decoding="async"
 className="w-full h-full object-cover"
 />
 </picture>
 <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
 <div className="absolute bottom-6 left-6">
 <span className="bg-terracotta-500/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wide">
 {post.category}
 </span>
 </div>
 </div>

 <div className="p-8 sm:p-10">
 <h1 className="heading-display text-3xl sm:text-4xl font-bold text-gray-900 mb-6 tracking-tight">
 {post.title}
 </h1>

 <div className="flex items-center flex-wrap gap-x-4 gap-y-2 text-sm text-gray-500 mb-8 pb-8 border-b border-gray-100 ">
 <span className="flex items-center">
 <User className="h-4 w-4 mr-1.5" aria-hidden="true" />
 {post.author}
 </span>
 <span className="flex items-center">
 <Calendar className="h-4 w-4 mr-1.5" aria-hidden="true" />
 {post.date}
 </span>
 <span className="flex items-center">
 <Clock className="h-4 w-4 mr-1.5" aria-hidden="true" />
 {post.readTime}
 </span>
 </div>

 <div
 className="prose prose-lg prose-emerald max-w-none"
 dangerouslySetInnerHTML={{ __html: post.content }}
 />
 </div>
 </article>
 </div>
 </div>
 );
};

export default BlogPost;
