import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Globe,
  Users,
  Shield,
  Map,
  Calculator,
  Bot,
  Receipt,
  BadgeDollarSign,
  User,
  TrendingUp,
  Leaf
} from 'lucide-react';
import DashboardNav from '../components/DashboardNav';

const Dashboard = () => {

  // English-only data matching FinAdvise
  const navItems = {
    dashboard: "Dashboard",
    reels: "Reels",
    news: "News",
    advisormap: "AdvisorMap",
  };

  const heroData = {
    title: "Smart Agricultural Planning for Your Future",
    subtitle: "Expert guidance, crop management, and government schemes all in one place",
  };

  const features = [
    {
      title: "AI Crop Advisor",
      description: "Get personalized crop recommendations and disease diagnosis using AI",
      link: "https://huggingface.co/spaces/ash1sh08/Agri_bot",
      icon: Bot,
    },
    {
      title: "Smart Crop Prediction",
      description: "Analyze crop images to detect diseases, pests, and health issues instantly",
      link: "/diagnostics",
      icon: Shield,
    },
    {
      title: "Weather Intelligence",
      description: "Real-time weather forecasts and climate-smart farming advice",
      link: "/weather",
      icon: Globe,
    },
    {
      title: "Crop Yield Prediction",
      description: "Predict crop yield based on location, weather, and farming practices",
      link: "/yield-prediction",
      icon: TrendingUp,
    },
    {
      title: "Plant Disease Detection",
      description: "AI-powered plant disease diagnosis with treatment recommendations",
      link: "/plant-disease",
      icon: Leaf,
    },
    {
      title: "Equipment Sharing",
      description: "Rent and share agricultural equipment with other farmers in your community",
      link: "/equipment-sharing",
      icon: Calculator,
    },
    {
      title: "Expense Tracker",
      description: "Track your farm income and expenses with detailed analytics",
      link: "/expense-tracker",
      icon: Receipt,
    },
    {
      title: "Government Schemes",
      description: "Track subsidies, benefits, and government programs",
      link: "/schemes",
      icon: Shield,
    },
    {
      title: "Farmer Community",
      description: "Connect with farmers, share experiences, and learn best practices",
      link: "/community",
      icon: Users,
    },
    {
      title: "Expert Consultation",
      description: "Book video calls with agricultural specialists and experts",
      link: "/experts",
      icon: User,
    },
    {
      title: "Farmer Analytics",
      description: "Comprehensive agricultural data analysis and insights",
      link: "/farmer-analytics",
      icon: Map,
    },
   
    
  ];

  // Features component
  const Features = () => {
    return (
      <section className="py-24 bg-gradient-to-b from-white to-green-50 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-green-200/10 to-emerald-200/10 blur-2xl" />
          {/* Animated background elements */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-green-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-emerald-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute top-20 left-20 w-40 h-40 bg-teal-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Link
                key={index}
                to={feature.link}
                className="block relative rounded-2xl cursor-pointer group"
              >
                <div className="relative p-8 dashboard-card group-hover:scale-105 group-hover:shadow-2xl group-hover:border-green-200">
                  <div className="mb-6 icon-container relative z-10">
                    {React.createElement(feature.icon, {
                      className: "h-16 w-16 text-green-600 transition-all duration-300 group-hover:text-emerald-600 group-hover:drop-shadow-lg"
                    })}
                  </div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4 transition-all duration-300 group-hover:from-emerald-600 group-hover:to-green-600 relative z-10 group-hover:scale-102">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed flex-grow transition-colors duration-300 group-hover:text-gray-700 relative z-10">
                    {feature.description}
                  </p>
                  <div className="mt-6 relative z-10">
                    <span className="inline-flex items-center text-emerald-600 font-semibold transition-all duration-300 group-hover:text-green-600 group-hover:translate-x-1 group-hover:scale-102">
                      Explore
                      <svg
                        className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1 group-hover:scale-105"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    );
  };


  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white relative overflow-x-hidden">
        <DashboardNav />
        <header className="text-center pt-20 sm:pt-24 px-4">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-green-800 mb-3 sm:mb-4">{heroData.title}</h1>
          <p className="text-sm sm:text-base lg:text-lg text-green-600 max-w-4xl mx-auto">{heroData.subtitle}</p>
        </header>
        <Features />
      </div>
    </>
  );
};

export default Dashboard;
