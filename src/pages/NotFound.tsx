import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
 return (
 <div className="min-h-[60vh] flex items-center justify-center px-4 bg-warm-50 ">
 <div className="text-center">
 <h1 className="text-8xl font-bold tracking-tight text-primary-600 mb-4 heading-display">404</h1>
 <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-4 heading-display">Page Not Found</h2>
 <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
 The page you're looking for doesn't exist or has been moved.
 </p>
 <div className="flex flex-col sm:flex-row gap-4 justify-center">
 <Link
 to="/"
 className="inline-flex items-center bg-terracotta-500 text-white px-6 py-3 rounded-xl hover:bg-terracotta-600 transition-all duration-200 font-semibold hover:shadow-soft-md"
 >
 <Home className="mr-2 h-5 w-5" aria-hidden="true" />
 Go Home
 </Link>
 <button
 type="button"
 onClick={() => window.history.back()}
 className="inline-flex items-center bg-gray-200 text-gray-900 px-6 py-3 rounded-xl hover:bg-gray-300 transition-all duration-200 font-semibold hover:shadow-soft-md"
 >
 <ArrowLeft className="mr-2 h-5 w-5" aria-hidden="true" />
 Go Back
 </button>
 </div>
 </div>
 </div>
 );
};

export default NotFound;
