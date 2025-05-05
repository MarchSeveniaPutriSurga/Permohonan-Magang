import React from "react";
import { FaTwitter, FaFacebookF, FaInstagram, FaYoutube } from "react-icons/fa"; // Impor ikon dari react-icons

function Footer() {
  return (
    <footer className="footer bg-stone-100 text-neutral-content p-4 w-full">
      <div className="flex justify-between items-center">
        {/* Copyright Section */}
        <div className="flex items-center space-x-2">
          <p>Copyright © {new Date().getFullYear()} - All rights reserved</p>
        </div>

        {/* Social Media Icons */}
        <div className="flex space-x-4">
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-black-500 hover:text-gray-700  hover:scale-110 transition-all duration-300"
          >
            <FaTwitter size={24} />
          </a>
          <a
            href="https://youtube.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-black-500 hover:text-gray-700  hover:scale-110 transition-all duration-300"
          >
            <FaYoutube size={24} />
          </a>
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-black-500 hover:text-gray-700  hover:scale-110 transition-all duration-300"
          >
            <FaFacebookF size={24} />
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-black-500 hover:text-gray-700  hover:scale-110 transition-all duration-300"
          >
            <FaInstagram size={24} />
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
