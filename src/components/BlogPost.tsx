import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Clock, User, ArrowLeft } from 'lucide-react';

const BlogPost = () => {
  const { id } = useParams();

  // This would typically come from an API or database
  const post = {
    id: '1',
    title: 'Revolutionizing African Agriculture with AI-Powered Robotics',
    content: `
      <p>Africa's agricultural sector stands at a pivotal moment, facing both unprecedented challenges and opportunities. Through our innovative AI and robotics programs at ChipuRobo, we're witnessing a transformation in how young African innovators approach agricultural challenges.</p>

      <h2>The Challenge</h2>
      <p>Small-scale farmers across East Africa face numerous challenges, from unpredictable weather patterns to crop diseases. Traditional farming methods, while valuable, often struggle to keep pace with these evolving challenges.</p>

      <h2>Our Innovation</h2>
      <p>Our students have developed an AI-powered robot that can:</p>
      <ul>
        <li>Monitor crop health in real-time</li>
        <li>Detect early signs of plant diseases</li>
        <li>Provide precise irrigation recommendations</li>
        <li>Optimize resource utilization</li>
      </ul>

      <h2>Impact and Results</h2>
      <p>Initial trials with local farming communities have shown promising results:</p>
      <ul>
        <li>30% reduction in water usage</li>
        <li>45% improvement in early disease detection</li>
        <li>20% increase in crop yield</li>
      </ul>

      <h2>Looking Ahead</h2>
      <p>This is just the beginning of our journey to revolutionize African agriculture through technology. By combining traditional farming knowledge with cutting-edge AI and robotics, we're creating solutions that are both innovative and culturally relevant.</p>
    `,
    author: 'Anthony Mwangi',
    date: 'March 15, 2025',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1563089145-599997674d42',
    category: 'Agriculture'
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <Link 
        to="/blog"
        className="inline-flex items-center text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 mb-8"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Blog
      </Link>

      <article className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="relative h-96 overflow-hidden">
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 left-4">
            <span className="bg-primary-500 text-white px-3 py-1 rounded-full text-sm">
              {post.category}
            </span>
          </div>
        </div>

        <div className="p-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
            {post.title}
          </h1>

          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-8">
            <User className="h-4 w-4 mr-1" />
            <span>{post.author}</span>
            <span className="mx-2">•</span>
            <Calendar className="h-4 w-4 mr-1" />
            <span>{post.date}</span>
            <span className="mx-2">•</span>
            <Clock className="h-4 w-4 mr-1" />
            <span>{post.readTime}</span>
          </div>

          <div 
            className="prose prose-lg dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>
      </article>
    </div>
  );
};

export default BlogPost;