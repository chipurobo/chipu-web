import { useParams, Link } from 'react-router-dom';
import { Calendar, Clock, User, ArrowLeft } from 'lucide-react';
import { getBlogPostById } from '../data/blogPosts';

const BlogPost = () => {
  const { id } = useParams<{ id: string }>();
  const post = id ? getBlogPostById(id) : undefined;

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-28 text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Post Not Found</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">The blog post you're looking for doesn't exist.</p>
        <Link
          to="/blog"
          className="inline-flex items-center text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
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
          className="inline-flex items-center text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 mb-8 font-medium text-sm transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Blog
        </Link>

        <article className="bg-white dark:bg-gray-800 rounded-xl shadow-soft-lg border border-gray-100 dark:border-gray-700/50 overflow-hidden">
          <div className="relative h-80 sm:h-96 overflow-hidden">
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <div className="absolute bottom-6 left-6">
              <span className="bg-primary-500/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wide">
                {post.category}
              </span>
            </div>
          </div>

          <div className="p-8 sm:p-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight">
              {post.title}
            </h1>

            <div className="flex items-center flex-wrap gap-x-4 gap-y-2 text-sm text-gray-500 dark:text-gray-400 mb-8 pb-8 border-b border-gray-100 dark:border-gray-700/50">
              <span className="flex items-center">
                <User className="h-4 w-4 mr-1.5" />
                {post.author}
              </span>
              <span className="flex items-center">
                <Calendar className="h-4 w-4 mr-1.5" />
                {post.date}
              </span>
              <span className="flex items-center">
                <Clock className="h-4 w-4 mr-1.5" />
                {post.readTime}
              </span>
            </div>

            <div
              className="prose prose-lg prose-emerald dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>
        </article>
      </div>
    </div>
  );
};

export default BlogPost;
