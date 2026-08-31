import React, { useState } from 'react';
import { BadgeDollarSign } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    console.log('Newsletter subscription:', email);
    setEmail('');
  };

  const footerLinks = {
    services: [
      { name: 'Crop Advisory', href: '#features' },
      { name: 'Disease Detection', href: '#features' },
      { name: 'Market Analysis', href: '#features' },
      { name: 'Weather Forecast', href: '#features' }
    ],
    company: [
      { name: 'About Us', href: '#about' },
      { name: 'Our Team', href: '#' },
      { name: 'Careers', href: '#' },
      { name: 'Blog', href: '#' }
    ],
    resources: [
      { name: 'Help Center', href: '#' },
      { name: 'API Documentation', href: '#' },
      { name: 'Training Resources', href: '#' },
      { name: 'Community Forum', href: '#' }
    ],
    legal: [
      { name: 'Privacy Policy', href: '#' },
      { name: 'Terms of Service', href: '#' },
      { name: 'Cookie Policy', href: '#' },
      { name: 'Data Security', href: '#' }
    ]
  };

  return (
    <footer className="bg-green-50 w-full">
      <div className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="lg:flex lg:items-start lg:gap-8">
          <div className="text-green-600">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <BadgeDollarSign className="h-8 w-8" />
              <span className="text-2xl font-bold text-green-800">KrushiSetu</span>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-8 lg:mt-0 lg:grid-cols-5 lg:gap-y-16">
            {/* Newsletter */}
            <div className="col-span-2">
              <h2 className="text-2xl font-bold text-gray-900">Stay Agriculturally Informed</h2>
              <p className="mt-4 text-gray-500">
                Get expert farming tips, crop insights, and AI-powered recommendations to help you maximize your agricultural yield.
              </p>
            </div>

            <div className="col-span-2 lg:col-span-3 lg:flex lg:items-end">
              <form onSubmit={handleNewsletterSubmit} className="w-full">
                <label htmlFor="UserEmail" className="sr-only">Email</label>
                <div className="border border-gray-100 p-2 focus-within:ring-3 sm:flex sm:items-center sm:gap-4">
                  <input
                    type="email"
                    id="UserEmail"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border-none focus:border-transparent focus:ring-transparent sm:text-sm"
                  />
                  <button 
                    type="submit"
                    className="mt-1 w-full bg-green-600 px-6 py-3 text-sm font-bold tracking-wide text-white uppercase hover:bg-green-700 sm:mt-0 sm:w-auto transition-colors duration-200"
                  >
                    Subscribe
                  </button>
                </div>
              </form>
            </div>

            {/* Services */}
            <div className="col-span-2 sm:col-span-1">
              <p className="font-medium text-gray-900">Agricultural Services</p>
              <ul className="mt-6 space-y-4 text-sm">
                {footerLinks.services.map((link, index) => (
                  <li key={index}>
                    <a href={link.href} className="text-gray-700 hover:opacity-75 transition-opacity duration-200">
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div className="col-span-2 sm:col-span-1">
              <p className="font-medium text-gray-900">Company</p>
              <ul className="mt-6 space-y-4 text-sm">
                {footerLinks.company.map((link, index) => (
                  <li key={index}>
                    <a href={link.href} className="text-gray-700 hover:opacity-75 transition-opacity duration-200">
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div className="col-span-2 sm:col-span-1">
              <p className="font-medium text-gray-900">Resources</p>
              <ul className="mt-6 space-y-4 text-sm">
                {footerLinks.resources.map((link, index) => (
                  <li key={index}>
                    <a href={link.href} className="text-gray-700 hover:opacity-75 transition-opacity duration-200">
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div className="col-span-2 sm:col-span-1">
              <p className="font-medium text-gray-900">Legal</p>
              <ul className="mt-6 space-y-4 text-sm">
                {footerLinks.legal.map((link, index) => (
                  <li key={index}>
                    <a href={link.href} className="text-gray-700 hover:opacity-75 transition-opacity duration-200">
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Social Media */}
            <ul className="col-span-2 flex justify-start gap-6 lg:col-span-5 lg:justify-end">
              {/* Facebook */}
              <li>
                <a href="#" className="text-gray-700 hover:opacity-75 transition-opacity duration-200" aria-label="Facebook">
                  <svg className="size-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
              </li>
              {/* Instagram */}
              <li>
                <a href="#" className="text-gray-700 hover:opacity-75 transition-opacity duration-200" aria-label="Instagram">
                  <svg className="size-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987s11.987-5.367 11.987-11.987C24.004 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.418-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.928.875 1.418 2.026 1.418 3.323s-.49 2.448-1.418 3.244c-.875.807-2.026 1.297-3.323 1.297zm7.83-9.781c-.49 0-.928-.175-1.297-.49-.368-.315-.49-.753-.49-1.243s.122-.928.49-1.243c.369-.315.807-.49 1.297-.49s.928.175 1.297.49c.368.315.49.753.49 1.243s-.122.928-.49 1.243c-.369.315-.807.49-1.297.49z" clipRule="evenodd" />
                  </svg>
                </a>
              </li>
              {/* LinkedIn */}
              <li>
                <a href="#" className="text-gray-700 hover:opacity-75 transition-opacity duration-200" aria-label="LinkedIn">
                  <svg className="size-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" clipRule="evenodd" />
                  </svg>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-100 pt-8">
          <div className="sm:flex sm:justify-between">
            <p className="text-xs text-gray-500">&copy; {currentYear} KrushiSetu. All rights reserved.</p>

            <ul className="mt-8 flex flex-wrap justify-start gap-4 text-xs sm:mt-0 lg:justify-end">
              <li>
                <a href="#" className="text-gray-500 transition hover:opacity-75">Terms & Conditions</a>
              </li>
              <li>
                <a href="#" className="text-gray-500 transition hover:opacity-75">Privacy Policy</a>
              </li>
              <li>
                <a href="#" className="text-gray-500 transition hover:opacity-75">Cookies</a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
