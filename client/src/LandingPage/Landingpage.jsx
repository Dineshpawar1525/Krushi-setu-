import React from 'react'
import "./LandingPage.css"
import { LandNavbar } from './Navbar/LandNavbar';
import Hero from './Hero/Hero';
import Programs from './Programs/Programs';
import Title from './Title/Title';
import About from './About/About';
import Campus from './Campus/Campus';
import Testimonials from './Testimonials/Testimonials';
import Contact from './Contact/Contact';
import Footer from './Footer/Footer';
import FloatingChatButton from '../components/FloatingChatButton';
import VoiceNavigator from '../components/VoiceNavigator';
import SimpleVoiceTest from '../components/SimpleVoiceTest';
import VisualTest from '../components/VisualTest';
import useScrollVideoPlay from '../hooks/useScrollVideoPlay';


import {
  BookOpen,
  Users,
  Shield,
  Briefcase,
  GraduationCap,
  Award,
  FileText, 
  Bot, 
  Receipt
} from "lucide-react";

import LandingPageCards from "../components/LandingPageCards";

const TimelineItem = ({ step, index }) => {
  const { videoRef, isInView, hasPlayed } = useScrollVideoPlay({
    threshold: 0.6,
    rootMargin: '50px',
    autoplayOnce: true
  });

  return (
    <div
      className={`flex flex-col ${
        index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
      } items-center gap-8 mb-16 relative`}
    >
      {/* Timeline connector */}
      <div className="hidden md:block absolute h-full w-0.5 bg-green-200 left-1/2 transform -translate-x-1/2 -z-10">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-4 w-4 bg-green-400 rounded-full border-4 border-white shadow" />
      </div>

      {/* YouTube Video Container */}
      <div className="w-full md:w-1/2 relative" ref={videoRef}>
        <div
          className="relative rounded-xl overflow-hidden shadow-lg"
          style={{ height: "315px" }}
        >
          <iframe
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${step.youtubeId}?start=1&autoplay=${isInView && !hasPlayed ? 1 : 0}&mute=0`}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>

      {/* Content */}
      <div className="w-full md:w-1/2 space-y-4">
        <div className="backdrop-blur-sm bg-white/50 rounded-xl p-6">
          {/* Step Number */}
          <div className="inline-block px-3 py-1 rounded-full bg-green-50 text-green-700 text-sm font-medium mb-4">
            Step {index + 1}
          </div>

          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            {step.title}
          </h3>

          <p className="text-gray-600 mb-4 leading-relaxed">
            {step.description}
          </p>

          <div className="pt-4 border-t border-gray-100/20">
            <p className="text-gray-500 text-sm">{step.extraDescription}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const SuccessStoryTimeline = ({ steps }) => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl">
      {steps.map((step, index) => (
        <TimelineItem key={index} step={step} index={index} />
      ))}
    </div>
  );
};


const LandingPage = () => {
  return (
    <div className='bg-green-50'>
      <LandNavbar/>
      <Hero/>
      <div className="container mt-0">
      <Title subTitle='Our PROGRAM' title='What We Offer'/>
      <Programs/>
      <About/>
      <Title subTitle='Memories' title='Overview'/>
      {/* <Campus/>
      */}
     <div className='testimonials-container'>
     <Testimonials/>
     </div>

     <LandingPageCards items={[
       {
         title: "AI Farming Assistant",
         description: "Get personalized agricultural advice from our AI-powered chatbot",
         features: [
           "24/7 AI-powered assistance",
           "Crop recommendations",
           "Disease diagnosis & treatment",
           "Weather-based farming advice"
         ],
         benefits: "Save time and get expert farming guidance anytime, anywhere",
         link: "/advisor",
         icon: Bot,
       },
       {
         title: "Crop Disease Detection",
         description: "AI-powered plant disease detection and treatment recommendations",
         features: [
           "Image-based disease diagnosis",
           "Treatment recommendations",
           "Prevention strategies",
           "Expert consultation"
         ],
         benefits: "Detect and treat plant diseases early to maximize crop yield",
         link: "/plant-disease",
         icon: Briefcase,
       },
       {
         title: "Government Schemes",
         description: "Access agricultural government schemes and benefits",
         features: [
           "Agricultural subsidies",
           "Crop insurance schemes",
           "Loan facilities",
           "Training programs"
         ],
         benefits: "Access comprehensive information about government agricultural support",
         link: "/scheme",
         icon: Shield,
       },
       {
         title: "Farmer Community",
         description: "Join the farming community to discuss and share agricultural knowledge",
         features: [
           "Discussion forums",
           "Expert Q&A sessions",
           "Peer networking",
           "Knowledge sharing"
         ],
         benefits: "Connect with fellow farmers and agricultural experts",
         link: "/community",
         icon: Users,
       },
       {
         title: "Expert Q&A Sessions",
         description: "Participate in live QnA sessions with agricultural experts",
         features: [
           "Live expert sessions",
           "Interactive discussions",
           "Topic-specific Q&A",
           "Recorded sessions"
         ],
         benefits: "Get direct answers from certified agricultural professionals",
         link: "/qna",
         icon: GraduationCap,
       },
       {
         title: "Farmer Success Stories",
         description: "Read inspiring stories of farmers who have achieved success",
         features: [
           "Real-life case studies",
           "Step-by-step journeys",
           "Lessons learned",
           "Motivational content"
         ],
         benefits: "Learn from real farming experiences and find motivation for your agricultural journey",
         link: "/stories",
         icon: Award,
       },
       {
         title: "Smart Crop Analysis",
         description: "Analyze crop health and growth with AI-powered image processing",
         features: [
           "Image scanning",
           "Health assessment",
           "Growth analysis",
           "Report generation"
         ],
         benefits: "Digitize and analyze crop conditions instantly",
         link: "/crop-analysis",
         icon: FileText,
       },
       {
         title: "Farm Expense Tracker",
         description: "Track and manage your farm expenses with smart categorization",
         features: [
           "Expense categorization",
           "Budget tracking",
           "Spending insights",
           "Financial reports"
         ],
         benefits: "Gain control over your farm spending and improve financial habits",
         link: "/expenses",
         icon: Receipt,
       },
       {
         title: "Agricultural Scams Awareness", 
         description: "Learn about agricultural scams through interactive visualizations",
         features: [
           "Common scam types",
           "Prevention tips",
           "Interactive examples",
           "Reporting procedures"
         ],
         benefits: "Protect yourself from agricultural fraud and scams",
         link: "/scams",
         icon: Shield,
       },
       {
         title: "Agricultural Learning Games", 
         description: "Learn agricultural concepts through interactive games and quizzes",
         features: [
           "Educational games",
           "Interactive quizzes",
           "Progress tracking",
           "Rewards system"
         ],
         benefits: "Make learning agriculture engaging and enjoyable",
         link: "/game",
         icon: BookOpen,
       },
     ]} />
        <section className="py-12 bg-white text-center">
          <h2 className="text-2xl font-bold text-green-800">
            Success Stories of Farmers
          </h2>
          <p className="mt-2 text-green-600">Inspiring journeys of overcoming adversity</p>
          <SuccessStoryTimeline steps={[
            {
              title: "Rising from Poverty",
              description:
                "A story of determination and hard work leading to financial stability",
              icon: "🌟",
              youtubeId: "zZ-VeqYPxoA",
            },
            {
              title: "Empowering Women",
              description:
                "How micro-financing helped women start their own businesses",
              icon: "👩‍💼",
              youtubeId: "i9UYbJ2xMTI",
            },
            {
              title: "Education for All",
              description: "Providing education to children in impoverished areas",
              icon: "📚",
              youtubeId: "VILohre4Q6w",
            },
            {
              title: "Community Support",
              description:
                "Building a support network to uplift entire communities",
              icon: "🤝",
              youtubeId: "EsrJ_NKBkww",
            },
            {
              title: "Community Support",
              description:
                "Building a support network to uplift entire communities",
              icon: "🤝",
              youtubeId: "EsrJ_NKBkww",
            },
          ]} />
        </section>
     
      <Title subTitle='Contact Us' title='Get in  Touch'/>
      <Contact/>
      <Footer/>
      
      </div>
      
      {/* AI Farming Assistant Chat */}
      <FloatingChatButton />
      
      {/* Voice Navigator */}
      <VoiceNavigator />
      
      {/* Simple Voice Test - Debug */}
      <SimpleVoiceTest />
      
      {/* Visual Test - Debug */}
      <VisualTest />
      
    </div>
  )
}

export default LandingPage