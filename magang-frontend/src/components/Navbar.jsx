import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/images/logo.png";
import { FaRegUser, FaUserCircle } from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";

import "../assets/css/App.css";

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Data statis user yang sudah login
  const userData = {
    name: "John Doe",
    email: "johndoe@example.com",
  };

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  // klik di luar dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <nav className="bg-custom-khaki text-white p-4 shadow-md fixed top-0 left-0 w-full z-50">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img src={logo} alt="DISKOMINFO Logo" className="h-12" />
          <div>
            <h1 className="text-xl font-bold">DISKOMINFO</h1>
            <p className="text-sm">Daerah Istimewa Yogyakarta</p>
          </div>
        </div>

        <div className="hidden md:flex space-x-6">
          <Link
            to="/pendaftaran-magang"
            className="text-lg font-semibold hover:text-neutral-300 hover:no-underline transition duration-300"
          >
            Magang
          </Link>
          <Link
            to="/status-magang"
            className="text-lg font-semibold hover:text-neutral-300 hover:no-underline transition duration-300"
          >
            Status Magang
          </Link>
        </div>

        {/* Dropdown Profil */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={toggleDropdown}
            className="focus:outline-none text-3xl cursor-pointer hover:text-neutral-400 transition duration-300 flex items-center"
          >
            <FaUserCircle />
          </button>

          {/* Dropdown Menu dengan Informasi User */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 bg-white text-black rounded-lg shadow-xl w-64 transition-all duration-300 ease-in-out">
              {/* User Info Section */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center space-x-3 mb-2">
                  <FaUserCircle className="text-3xl text-blue-500" />
                  <div>
                    <p className="font-semibold text-gray-800">
                      {userData.name}
                    </p>
                    <p className="text-sm text-gray-500">{userData.email}</p>
                  </div>
                </div>
              </div>

              {/* Menu Options */}
              <Link
                to="/login"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-red-100 rounded-b-lg flex items-center space-x-2 transition duration-200"
              >
                <FiLogOut className="text-red-500" />
                <span>Logout</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
