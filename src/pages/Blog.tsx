import { Link } from 'react-router-dom';
import { Calendar, Clock, User, ArrowRight, BookOpen } from 'lucide-react';
import { blogPosts } from '../data/blogPosts';

const Blog = () => {
  return (
    <div className="bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-900 to-emerald-900/80 dark:from-black dark:to-primary-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(16,185,129,0.1),transparent_70%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 lg:py-32">
          <div className="text-center">
            <BookOpen className="h-12 w-12 text-emerald-400 mx-auto mb-6" aria-hidden="true" />
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">Our Blog</h1>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Insights and Stories from Africa's AI Innovation Hub
            </p>
          </div>
        </div>
      </section>

      {/* Blog Grid */}
      <div className="section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post) => (
              <article
                key={post.id}
                className="group bg-white dark:bg-gray-800 rounded-xl shadow-soft-md border border-gray-100 dark:border-gray-700/50 overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-soft-lg"
              >
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  <div className="absolute top-4 left-4">
                    <span className="bg-primary-500/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wide">
                      {post.category}
                    </span>
                  </div>
                  <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                    <post.icon className="h-5 w-5 text-white" />
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500 dark:text-gray-400 mb-3">
                    <span className="flex items-center">
                      <User className="h-3.5 w-3.5 mr-1" />
                      {post.author}
                    </span>
                    <span className="flex items-center">
                      <Calendar className="h-3.5 w-3.5 mr-1" />
                      {post.date}
                    </span>
                    <span className="flex items-center">
                      <Clock className="h-3.5 w-3.5 mr-1" />
                      {post.readTime}
                    </span>
                  </div>

                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 line-clamp-2">
                    {post.title}
                  </h2>

                  <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm line-clamp-2">
                    {post.excerpt}
                  </p>

                  <Link
                    to={`/blog/${post.id}`}
                    className="inline-flex items-center text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium text-sm transition-colors"
                  >
                    Read More
                    <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blog;
