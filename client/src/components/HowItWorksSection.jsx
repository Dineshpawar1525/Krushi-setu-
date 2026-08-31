import React from 'react';
import { UserCheck, User, Network, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HowItWorksSection = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/dashboard');
  };

  const steps = [
    {
      number: "01",
      title: "Sign Up",
      description: "Create your profile in minutes",
      icon: <UserCheck className="w-8 h-8 text-white" />
    },
    {
      number: "02",
      title: "Build Your Profile",
      description: "Showcase your skills and goals",
      icon: <User className="w-8 h-8 text-white" />
    },
    {
      number: "03",
      title: "Connect & Explore",
      description: "Find mentors and opportunities",
      icon: <Network className="w-8 h-8 text-white" />
    },
    {
      number: "04",
      title: "Achieve with AI",
      description: "Get personalized recommendations",
      icon: <Sparkles className="w-8 h-8 text-white" />
    }
  ];

  return (
    <section id="solutions" className="py-20 bg-gradient-to-br from-green-50 via-white to-emerald-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-32 h-32 bg-green-200/20 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-emerald-200/15 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-green-100/30 rounded-full blur-xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 animate-fade-in-up">
            How It Works
          </h2>
          <p className="text-lg text-gray-600 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
            Get started in just a few simple steps
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Animated Connection Lines - Hidden on mobile */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-green-400 via-emerald-400 to-green-400 transform -translate-y-1/2 z-0 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-transparent via-white to-transparent animate-shimmer"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
            {steps.map((step, index) => (
              <div 
                key={index} 
                className="text-center group animate-fade-in-up"
                style={{animationDelay: `${0.4 + index * 0.2}s`}}
              >
                {/* Icon with hover effects */}
                <div className="relative mb-6">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg mb-4 group-hover:scale-110 group-hover:shadow-2xl transition-all duration-500 group-hover:rotate-6">
                    <div className="group-hover:scale-110 transition-transform duration-300">
                      {step.icon}
                    </div>
                  </div>
                  
                  {/* Floating particles around icon */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-2 left-2 w-2 h-2 bg-green-300 rounded-full animate-float" style={{animationDelay: '0s'}}></div>
                    <div className="absolute top-4 right-3 w-1.5 h-1.5 bg-emerald-300 rounded-full animate-float" style={{animationDelay: '0.5s'}}></div>
                    <div className="absolute bottom-3 left-4 w-1 h-1 bg-green-400 rounded-full animate-float" style={{animationDelay: '1s'}}></div>
                  </div>
                </div>

                {/* Step Number with animation */}
                <div className="text-green-600 font-bold text-lg mb-2 group-hover:scale-110 transition-transform duration-300">
                  {step.number}
                </div>

                {/* Step Title with underline animation */}
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors duration-300 relative">
                  {step.title}
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-green-500 group-hover:w-full transition-all duration-500"></div>
                </h3>

                {/* Step Description with fade effect */}
                <p className="text-gray-600 text-sm group-hover:text-gray-800 transition-colors duration-300">
                  {step.description}
                </p>

                {/* Hover glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-green-400/0 via-green-400/5 to-green-400/0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Floating action button */}
        <div className="text-center mt-16">
          <button 
            onClick={handleGetStarted}
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-4 px-8 rounded-full transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105 animate-bounce-slow cursor-pointer"
          >
            Get Started Now
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
          opacity: 0;
        }

        .animate-shimmer {
          animation: shimmer 3s ease-in-out infinite;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
};

export default HowItWorksSection;
