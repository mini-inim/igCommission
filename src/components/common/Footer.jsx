// components/common/Footer.jsx
import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-gray-300 py-6">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center">
          <p className="text-sm">
            ✨ Made with passion by{' '}
            <a 
              href="https://kre.pe/jBVb" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-400 font-semibold hover:text-blue-300 transition-colors duration-200 cursor-pointer"
            >
              @Laso_cm
            </a>
          </p>
          <p className="text-xs text-gray-400 mt-1">
            © 2025 All rights reserved
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;