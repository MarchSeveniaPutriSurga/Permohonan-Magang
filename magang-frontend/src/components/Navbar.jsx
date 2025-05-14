import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/images/logo.png";
import { FaUserCircle } from "react-icons/fa";
import { FiLogOut, FiMenu } from "react-icons/fi";
import { getUserProfile } from "../utils/api";

const Navbar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userData, setUserData] = useState({ name: "", email: "" });
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);  // Reference untuk dropdown
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const user = await getUserProfile();
        setUserData(user);
      } catch (err) {
        console.error("Gagal memuat profil user", err);
      }
    };
    fetchProfile();

    // Menambahkan event listener untuk klik di luar dropdown
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);  // Menutup dropdown jika klik di luar
      }
    };

    // Menambahkan event listener saat komponen di-mount
    document.addEventListener("mousedown", handleClickOutside);

    // Membersihkan event listener saat komponen di-unmount
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <>
      {/* Navbar */}
      <nav className="bg-custom-khaki text-white p-4 shadow-md fixed top-0 left-0 w-full z-50">
        <div className="container mx-auto flex items-center justify-between">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <img src={logo} alt="DISKOMINFO Logo" className="h-12" />
            <div>
              <h1 className="text-xl font-bold">DISKOMINFO</h1>
              <p className="text-sm">Daerah Istimewa Yogyakarta</p>
            </div>
          </div>

          {/* Nav Items - Desktop */}
          <div className="hidden md:flex space-x-6">
            <Link to="/pendaftaran-magang" className="text-lg font-semibold hover:text-neutral-300">
              Magang
            </Link>
            <Link to="/status-magang" className="text-lg font-semibold hover:text-neutral-300">
              Status Magang
            </Link>

            {/* Dropdown for User Info & Logout */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-2 text-sm">
                <FaUserCircle className="text-2xl" />
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div
                  ref={dropdownRef}  // Menghubungkan dropdown dengan ref
                  className="absolute right-0 mt-2 bg-white text-black rounded-lg shadow-lg w-48 py-2">
                  <div className="px-4 py-2 flex items-center space-x-2">
                    <FaUserCircle className="text-xl text-blue-500" />
                    <div>
                      <p className="font-semibold text-gray-800">{userData.name || "Loading..."}</p>
                      <p className="text-sm text-gray-500">{userData.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-4 py-2 w-full text-left text-red-500 hover:bg-gray-200">
                    <FiLogOut className="text-xl" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Hamburger - Mobile */}
          <button
            className="md:hidden text-3xl text-white focus:outline-none"
            onClick={() => setSidebarOpen(true)}
          >
            <FiMenu />
          </button>
        </div>
      </nav>

      {/* Sidebar - Mobile */}
      <div
        className={`fixed top-0 left-0 w-64 h-full bg-stone-200 shadow-lg transform transition-transform z-50 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="p-4 border-b-2 border-gray-300">
          <div className="flex items-center space-x-3">
            <FaUserCircle className="text-3xl text-blue-500" />
            <div>
              <p className="font-semibold text-gray-800">{userData.name || "Loading..."}</p>
              <p className="text-sm text-gray-500">{userData.email}</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col p-4 space-y-4">
          <Link
            to="/pendaftaran-magang"
            className="text-lg font-medium text-gray-800 hover:text-neutral-600"
            onClick={() => setSidebarOpen(false)}
          >
            Magang
          </Link>
          <Link
            to="/status-magang"
            className="text-lg font-medium text-gray-800 hover:text-neutral-600"
            onClick={() => setSidebarOpen(false)}
          >
            Status Magang
          </Link>
          <button
            onClick={handleLogout}
            className="mt-4 flex items-center text-red-500 hover:text-red-700 space-x-2"
          >
            <FiLogOut />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Overlay when sidebar is open */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-30 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
};

export default Navbar;
