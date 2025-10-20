import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import Navbar from './components/Navbar';
import Home from './components/Home';
import About from './components/About';
import Team from './components/Team';
import Services from './components/Services';
import Contact from './components/Contact';
import SchoolRegistration from './components/SchoolRegistration';
import BootcampEnrollment from './components/BootcampEnrollment';
import FutureBuildersComingSoon from './components/FutureBuildersComingSoon';
import Blog from './components/Blog';
import BlogPost from './components/BlogPost';
import Footer from './components/Footer';
import Microsoft from './components/Microsoft';
import Program from './components/Program';
import Sustainability from './components/Sustainability';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/program" element={<Program />} />
            <Route path="/sustainability" element={<Sustainability />} />
            <Route path="/team" element={<Team />} />
            <Route path="/services" element={<Services />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/future-builders-registration" element={<FutureBuildersComingSoon />} />
            <Route path="/school-registration" element={<SchoolRegistration />} />
            <Route path="/bootcamp-enrollment" element={<BootcampEnrollment />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:id" element={<BlogPost />} />
            <Route path="/microsoft" element={<Microsoft />} />
          </Routes>
          <Footer />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;