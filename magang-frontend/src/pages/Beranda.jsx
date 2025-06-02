import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SplitText from "../components/SplitText";
import AnimatedContent from "../components/AnimatedContent";
import { getPublishedBidangs } from "../utils/api";

import logo from "../assets/images/logo.png";
import HeroImage from "../assets/images/intern.png";

import "../assets/css/App.css";
import "../assets/css/App-Bootstrap.css";

function Beranda() {
  const [scroll, setScroll] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const [bidangs, setBidangs] = useState([]);

  useEffect(() => {
    const fetchBidangs = async () => {
      try {
        const data = await getPublishedBidangs();
        setBidangs(data);
      } catch (error) {
        console.error("Gagal memuat bidang magang:", error);
      }
    };

    fetchBidangs();
  }, []);

  useEffect(() => {
    const loggedInStatus = localStorage.getItem("token");
    setIsLoggedIn(loggedInStatus ? true : false);
  }, []);

  const handleClick = () => {
    if (isLoggedIn) {
      navigate("/pendaftaran-magang");
    } else {
      navigate("/login");
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 5) {
        setScroll(true);
      } else {
        setScroll(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  let navbarStyle = scroll ? "py-6 bg-white shadow-md" : "py-4 bg-transparent";

  return (
    <div className="homepage pb-10">
      <div className="container mx-auto px-4">
        {/* Header */}
        <nav className={`fixed top-0 left-0 w-full z-50 transition-all ${navbarStyle}`}>
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center">
              <img src={logo} alt="DISKOMINFO Logo" className="h-12 mr-3" />
              <div>
                <h1 className="text-xl font-bold">DISKOMINFO</h1>
                <p className="text-sm">Daerah Istimewa Yogyakarta</p>
              </div>
            </div>
            <button className="animated-button" onClick={() => navigate("/login")}>
              <svg xmlns="http://www.w3.org/2000/svg" className="arr-2" viewBox="0 0 24 24">
                <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z"></path>
              </svg>
              <span className="text">L O G I N</span>
              <span className="circle"></span>
              <svg xmlns="http://www.w3.org/2000/svg" className="arr-1" viewBox="0 0 24 24">
                <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z"></path>
              </svg>
            </button>
          </div>
        </nav>

        {/* Content */}
        <div className="hero grid md:grid-cols-2 grid-cols-1 items-center gap-20 pt-32">
          <div className="box">
            <h1 className="lg:text-5xl text-3xl font-extrabold mb-7">
              <SplitText text="MAGANG" className="text-black-500 font-extrabold" delay={100} animationFrom={{ opacity: 0, transform: "translate3d(0, 40px, 0)" }} animationTo={{ opacity: 1, transform: "translate3d(0, 0, 0)" }} />
              <SplitText text="DISKOMINFO" className="text-black-500 font-extrabold" delay={200} animationFrom={{ opacity: 0, transform: "translate3d(0, 40px, 0)" }} animationTo={{ opacity: 1, transform: "translate3d(0, 0, 0)" }} />
              <br />
              <span className="font-bold text-gray-900">
                <AnimatedContent distance={50} direction="vertical" delay={300} animateOpacity={true} scale={1}>
                  <span className="font-bold text-gray-900">
                    Daerah Istimewa Yogyakarta
                  </span>
                </AnimatedContent>
              </span>
            </h1>
            <AnimatedContent distance={30} direction="vertical" delay={400}>
              <p className="text-base mb-7">
                Lorem ipsum dolor sit amet consectetur, adipisicing elit.
                Quibusdam unde sequi dolorem sapiente atque assumenda, culpa
                officiis voluptatibus voluptate quis!
              </p>
            </AnimatedContent>
            <AnimatedContent distance={40} direction="vertical" delay={500}>
              <button
                className="bg-stone-300 hover:bg-stone-500 text-black font-bold py-3 px-6 rounded-full shadow-sm shadow-neutral-600 hover:text-white transform transition-all duration-500 ease-in-out hover:scale-110 hover:brightness-110 hover:animate-pulse active:animate-bounce"
                onClick={handleClick}
              >
                Apply Sekarang
              </button>
            </AnimatedContent>
          </div>
          <div className="box">
            <AnimatedContent distance={50} direction="horizontal" delay={600}>
              <img
                src={HeroImage}
                alt="Hero Image"
                className="md:w-full w-[400px] mx-auto md:m-0"
              />
            </AnimatedContent>
          </div>
        </div>

        {/* Section Bidang Magang */}
        {/* Section Bidang Magang */}
        <section className="mt-24">
          <h2 className="text-3xl font-extrabold text-center text-gray-900 mb-12">
            Pilihan <span className="text-blue-600">Bidang Magang</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 px-4 md:px-0">
            {bidangs.length === 0 ? (
              <p className="col-span-full text-center text-gray-500">Belum ada bidang magang yang tersedia.</p>
            ) : (
              bidangs.map((bidang, index) => (
                <div
                  key={bidang.id}
                  className="group bg-white border border-gray-200 rounded-3xl p-6 shadow-sm hover:shadow-lg hover:border-blue-500 transition-all duration-300 relative overflow-hidden"
                >
                  <div className="absolute -top-10 -right-10 bg-blue-100 text-blue-600 p-4 rounded-full group-hover:scale-110 transition-transform duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L16.5 12L9.75 7V17Z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-blue-800 mb-3">{bidang.nama}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{bidang.deskripsi}</p>
                </div>
              ))
            )}
          </div>
        </section>

      </div>
    </div>
  );
}

export default Beranda;
