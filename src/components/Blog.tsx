import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, User, ArrowRight, School, GraduationCap, Users, Brain } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  readTime: string;
  image: string;
  category: string;
  icon: any;
}

const blogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'AI Literacy Workshop at Alliance Girls High School',
    excerpt: 'Empowering young women in technology through hands-on AI workshops and practical demonstrations at one of Kenya\'s premier national schools.',
    author: 'Cindy Mugire',
    date: 'March 28, 2025',
    readTime: '4 min read',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f',
    category: 'School Outreach',
    icon: School
  },
  {
    id: '2',
    title: 'Nairobi School AI Innovation Day',
    excerpt: 'Interactive AI workshop focusing on machine learning basics and real-world applications with enthusiastic participation from Nairobi School students.',
    author: 'Kevin Irungu',
    date: 'March 25, 2025',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998',
    category: 'School Outreach',
    icon: Brain
  },
  {
    id: '3',
    title: 'TVET AI Training at Tharaka Nithi University',
    excerpt: 'Bridging the gap between technical education and AI innovation through comprehensive workshops for TVET students and educators.',
    author: 'Anthony Mwangi',
    date: 'March 22, 2025',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4',
    category: 'Higher Education',
    icon: GraduationCap
  },
  {
    id: '4',
    title: 'Starehe Girls Center Embraces AI Education',
    excerpt: 'A transformative day of AI learning and exploration, inspiring the next generation of female tech leaders at Starehe Girls Center.',
    author: 'Jeffery Mulee',
    date: 'March 20, 2025',
    readTime: '4 min read',
    image: 'https://images.unsplash.com/photo-1571260899304-425eee4c7efc',
    category: 'School Outreach',
    icon: Users
  },
  {
    id: '5',
    title: 'AI Innovation Workshop at Starehe Boys Centre',
    excerpt: 'Engaging Starehe boys in cutting-edge AI technology and robotics, fostering innovation and technical creativity.',
    author: 'David Muguchia',
    date: 'March 18, 2025',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4',
    category: 'School Outreach',
    icon: School
  },
  {
    id: '6',
    title: 'Revolutionizing African Agriculture with AI-Powered Robotics',
    excerpt: 'How our students are developing autonomous farming solutions to address food security challenges in East Africa.',
    author: 'Anthony Mwangi',
    date: 'March 15, 2025',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1563089145-599997674d42',
    category: 'Innovation',
    icon: Brain
  }
];

const Blog = () => {
  return (
    <div className="bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Our Blog</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Insights and Stories from Africa's AI Innovation Hub
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post) => (
            <article 
              key={post.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-transform hover:scale-105"
            >
              <div className="relative h-48 overflow-hidden">
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
                <div className="absolute top-4 right-4">
                  <post.icon className="h-6 w-6 text-white" />
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <User className="h-4 w-4 mr-1" />
                  <span>{post.author}</span>
                  <span className="mx-2">•</span>
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>{post.date}</span>
                  <span className="mx-2">•</span>
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{post.readTime}</span>
                </div>
                
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {post.title}
                </h2>
                
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {post.excerpt}
                </p>
                
                <Link 
                  to={`/blog/${post.id}`}
                  className="inline-flex items-center text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                >
                  Read More
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Blog;