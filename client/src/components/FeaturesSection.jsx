import React, { useState, useEffect } from 'react';

const FeaturesSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const features = [
    {
      icon: (
        <svg className="w-12 h-12 text-[#2E7D44]" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      ),
      title: "AI-Powered Crop Advisory",
      description: "Get personalized recommendations for planting, irrigation, fertilization, and harvesting based on your specific location, soil conditions, and crop type.",
      benefits: ["24/7 Expert Advice", "Weather-Based Insights", "Yield Optimization"]
    },
    {
      icon: (
        <svg className="w-12 h-12 text-[#4CAF50]" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/>
        </svg>
      ),
      title: "Multi-Language Voice Support",
      description: "Interact with our AI assistant using your native language through voice commands. Perfect for farmers who prefer speaking over typing.",
      benefits: ["15+ Languages", "Voice Commands", "Offline Support"]
    },
    {
      icon: (
        <svg className="w-12 h-12 text-[#FF7043]" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
        </svg>
      ),
      title: "Disease Detection & Diagnosis",
      description: "Upload photos of your crops to get instant disease identification and treatment recommendations from our AI-powered image recognition system.",
      benefits: ["Instant Diagnosis", "Treatment Plans", "Prevention Tips"]
    },
    {
      icon: (
        <svg className="w-12 h-12 text-[#8BC34A]" fill="currentColor" viewBox="0 0 24 24">
          <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
        </svg>
      ),
      title: "Market Intelligence & Pricing",
      description: "Access real-time market prices, demand forecasts, and selling recommendations to maximize your profits and make informed business decisions.",
      benefits: ["Real-time Prices", "Market Trends", "Profit Optimization"]
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % features.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + features.length) % features.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  // Auto-play functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % features.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [features.length]);

  return (
    <section id="features" className="py-20 section-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="text-sm text-[#2E7D44] font-medium mb-2">POWERFUL FEATURES</p>
          <h2 className="text-4xl md:text-5xl font-bold text-[#212121] mb-4">
            Modern Agriculture
          </h2>
          <p className="text-body max-w-3xl mx-auto">
            Our comprehensive platform combines cutting-edge AI technology with deep agricultural expertise 
            to provide farmers with the tools they need to succeed in today's competitive market.
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-3 transition-all duration-300 hover:scale-110"
            aria-label="Previous feature"
          >
            <svg className="w-6 h-6 text-[#2E7D44]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-3 transition-all duration-300 hover:scale-110"
            aria-label="Next feature"
          >
            <svg className="w-6 h-6 text-[#2E7D44]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Carousel */}
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {features.map((feature, index) => (
                <div key={index} className="w-full flex-shrink-0 px-8">
                  <div className="max-w-4xl mx-auto">
                    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-8 md:p-12 text-center hover:shadow-2xl transition-all duration-300">
                      {/* Icon */}
                      <div className="mb-8 flex justify-center">
                        <div className="p-6 bg-gradient-to-br from-[#2E7D44]/10 to-[#4CAF50]/10 rounded-full">
                          {feature.icon}
                        </div>
                      </div>
                      
                      {/* Title */}
                      <h3 className="text-3xl md:text-4xl font-bold text-[#212121] mb-6">
                        {feature.title}
                      </h3>
                      
                      {/* Description */}
                      <p className="text-lg text-gray-600 leading-relaxed mb-8 max-w-2xl mx-auto">
                        {feature.description}
                      </p>
                      
                      {/* Benefits */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                        {feature.benefits.map((benefit, benefitIndex) => (
                          <div key={benefitIndex} className="flex items-center justify-center space-x-2 bg-[#F8FDF8] rounded-lg p-3">
                            <svg className="w-5 h-5 text-[#4CAF50] flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                            </svg>
                            <span className="text-sm font-medium text-[#2E7D44]">{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pagination Dots */}
          <div className="flex justify-center mt-8 space-x-3">
            {features.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`transition-all duration-300 ${
                  index === currentSlide
                    ? 'w-8 h-3 bg-[#2E7D44] rounded-full'
                    : 'w-3 h-3 bg-[#2E7D44]/30 rounded-full hover:bg-[#2E7D44]/50'
                }`}
                aria-label={`Go to feature ${index + 1}`}
              />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default FeaturesSection;
