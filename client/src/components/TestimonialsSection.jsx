import React from 'react';
import { Star, ArrowRight } from 'lucide-react';

const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Priya Sharma",
      avatar: "👩‍🌾",
      rating: 5,
      quote: "Best agricultural AI I've ever used! The crop recommendations are absolutely amazing.",
      service: "Crop Advisory",
      status: "Verified Customer",
      time: "2 days ago"
    },
    {
      name: "Rahul Patel",
      avatar: "👨‍🌾",
      rating: 5,
      quote: "Authentic farming advice that reminds me of my grandfather's wisdom.",
      service: "Market Analysis",
      status: "Regular Customer",
      time: "1 week ago"
    },
    {
      name: "Anjali Desai",
      avatar: "👩‍🌾",
      rating: 5,
      quote: "Fresh insights and perfect recommendations. Highly recommended!",
      service: "Disease Detection",
      status: "Food Blogger",
      time: "3 days ago"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-[#F8FDF8] via-[#E8F5E8] to-white relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-20 h-20 bg-orange-200/30 rounded-full blur-xl"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-yellow-200/20 rounded-full blur-2xl"></div>
        <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-orange-100/40 rounded-full blur-xl"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <div className="text-center mb-16">
          {/* Star Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
              <Star className="w-8 h-8 text-white fill-current" />
            </div>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            What Our Customers Say
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Don't just take our word for it - hear from our satisfied customers
          </p>
        </div>

        {/* Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 relative">
              {/* Star Rating */}
              <div className="flex items-center gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>

              {/* Customer Avatar */}
              <div className="absolute top-4 right-4 text-2xl">
                {testimonial.avatar}
              </div>

              {/* Quote */}
              <blockquote className="text-gray-700 italic mb-6 text-base leading-relaxed">
                "{testimonial.quote}"
              </blockquote>

              {/* Customer Info */}
              <div className="space-y-1">
                <div className="font-bold text-gray-900">{testimonial.name}</div>
                <div className="text-sm text-gray-500">
                  {testimonial.status} • {testimonial.time}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action Button */}
        <div className="text-center">
          <button className="bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded-full transition-all duration-300 flex items-center gap-2 mx-auto shadow-lg hover:shadow-xl">
            Read More Reviews
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
