import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Cpu, Database, Globe } from 'lucide-react';
import { useProjects } from '../context/ProjectContext';
import ProjectCard from '../components/projects/ProjectCard';

const HomePage = () => {
  const { projects, error, isLoading } = useProjects();
  const particlesContainer = useRef<HTMLDivElement>(null);

  // Handle loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg text-slate-600">Loading projects...</p>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-8 bg-red-50 rounded-lg max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Content</h2>
          <p className="text-red-500 mb-6">{error.message}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Safely get featured projects
  const featuredProjects = (Array.isArray(projects) 
    ? projects.filter(project => project?.featured) 
    : []
  ).slice(0, 3);

  // Particle animation effect
  useEffect(() => {
    if (!particlesContainer.current || typeof document === 'undefined') return;
    
    const container = particlesContainer.current;
    const particles: HTMLDivElement[] = [];

    const createParticle = (): HTMLDivElement | null => {
      try {
        const particle = document.createElement('div');
        particle.className = 'absolute bg-blue-500 rounded-full opacity-0';
        
        const size = Math.random() * 4 + 2;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        
        const duration = Math.random() * 20 + 10;
        particle.style.animation = `float ${duration}s linear infinite`;
        
        container.appendChild(particle);
        
        setTimeout(() => {
          if (particle && particle.classList.contains('opacity-0')) {
            particle.classList.replace('opacity-0', 'opacity-30');
          }
        }, 10);
        
        return particle;
      } catch (e) {
        console.error('Failed to create particle:', e);
        return null;
      }
    };

    // Create initial particles
    for (let i = 0; i < 50; i++) {
      const particle = createParticle();
      if (particle) particles.push(particle);
    }

    // Cleanup function
    return () => {
      particles.forEach(particle => {
        if (particle && particle.parentNode === container) {
          container.removeChild(particle);
        }
      });
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-gradient-to-b from-slate-900 to-slate-800">
        <style>
          {`
            @keyframes float {
              0% { transform: translate(0, 0) scale(1); }
              25% { transform: translate(10px, 10px) scale(1.1); }
              50% { transform: translate(0, 20px) scale(1); }
              75% { transform: translate(-10px, 10px) scale(0.9); }
              100% { transform: translate(0, 0) scale(1); }
            }
          `}
        </style>
        
        {/* Particle animation container */}
        <div 
          ref={particlesContainer}
          className="absolute inset-0 pointer-events-none overflow-hidden"
        ></div>
        
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
                Innovative Tech Solutions
              </span>{' '}
              for Your Next Project
            </h1>
            
            <p className="text-xl text-slate-300 mb-8 leading-relaxed">
              Specializing in IoT, blockchain, and web development. Creating custom solutions and ready-to-use projects.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                to="/projects" 
                className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-blue-600 rounded-lg shadow-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Browse Projects
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              
              <Link 
                to="/contact" 
                className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-blue-600 bg-white rounded-lg shadow-lg hover:bg-slate-100 transition-colors duration-200"
              >
                Request Custom Project
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 bg-white dark:bg-slate-800">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Expertise Areas</h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Creating innovative solutions across multiple technology domains
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-slate-700 p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
              <Cpu className="h-12 w-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">IoT Solutions</h3>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                Smart devices, sensors, automation systems, and connected hardware for various applications.
              </p>
            </div>
            
            <div className="bg-white dark:bg-slate-700 p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
              <Database className="h-12 w-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">Blockchain Development</h3>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                Decentralized applications, smart contracts, NFT platforms, and secure transaction systems.
              </p>
            </div>
            
            <div className="bg-white dark:bg-slate-700 p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
              <Globe className="h-12 w-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">Web Development</h3>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                Responsive websites, web applications, e-commerce platforms, and custom web solutions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      {featuredProjects.length > 0 && (
        <section className="py-16 bg-slate-50 dark:bg-slate-900">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Featured Projects</h2>
                <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl">
                  Explore some of my recent work across different technology domains
                </p>
              </div>
              
              <Link 
                to="/projects" 
                className="inline-flex items-center text-blue-600 dark:text-blue-400 font-medium mt-4 md:mt-0 hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-200"
              >
                View all projects
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">Need a Custom Technology Solution?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Let's collaborate to build the perfect solution for your specific requirements. 
            Custom development services available for IoT, blockchain, and web applications.
          </p>
          <Link 
            to="/contact" 
            className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-blue-700 bg-white rounded-lg shadow-lg hover:bg-blue-50 transition-colors duration-200"
          >
            Get in Touch
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;