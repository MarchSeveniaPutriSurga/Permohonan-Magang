import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Button, Offcanvas } from "react-bootstrap";
import { Routes, Route, Link, Navigate, useLocation } from "react-router-dom";
import {
  FaHome,
  FaBriefcase,
  FaUsers,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaUserCircle
} from "react-icons/fa";
import Overview from "../components/Overview";
import BidangMagang from "../components/BidangMagang";
import DataPendaftaran from "../components/DataPendaftaran";
import logo from "../assets/images/logo.png";
import { getUserProfile } from "../utils/api";

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showSidebar, setShowSidebar] = useState(false);
  const [adminInfo, setAdminInfo] = useState({ name: "", email: "" });

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const user = await getUserProfile();
        setAdminInfo(user);
      } catch (err) {
        console.error("Gagal memuat info admin:", err);
      }
    };
    fetchAdmin();
  }, []);

  const menuItems = [
    {
      path: "/dashboard/overview",
      label: "Overview",
      icon:
        <FaHome className="me-3" />,
      active: location.pathname === '/dashboard/overview'
    },
    {
      path: "/dashboard/bidang-magang",
      label: "Bidang Magang",
      icon:
        <FaBriefcase className="me-3" />,
      active: location.pathname.includes('bidang-magang')
    },
    {
      path: "/dashboard/data-pendaftaran",
      label: "Data Pendaftaran",
      icon:
        <FaUsers className="me-3" />,
      active: location.pathname.includes('data-pendaftaran')
    }
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const SidebarContent = ({ isMobile = false }) => (
    <div className={`h-100 d-flex flex-column ${isMobile ? 'p-3' : 'p-4'}`} style={{ //
      backgroundColor: '#fffff'
      , boxShadow: isMobile ? 'none' : '4px 0 20px rgba(236, 72, 153, 0.1)'
    }}>

      {/* Header with close button for mobile */}
      {isMobile && (
        <div className="d-flex  justify-content-end align-items-center mb-4">
          <Button variant="link" className="text-gray-700 p-0" onClick={() => setShowSidebar(false)}
            style={{ fontSize: '18px' }}
          >
            <FaTimes size={20} />
          </Button>
        </div>
      )}

      {/* Logo */}
      <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-300">
        <div className="w-[60px] h-[60px] rounded-full overflow-hidden flex-shrink-0">
          <img src={logo} alt="DISKOMINFO Logo" className="w-full h-full object-contain" />
        </div>

        <div>
          <h5 className="text-black font-bold text-[16px] leading-snug drop-shadow-sm">
            PERMOHONAN MAGANG
          </h5>
          <h6 className="text-black font-semibold text-[15px] leading-snug drop-shadow-sm">
            DISKOMINFO
          </h6>
          <p className="text-black/75 text-sm leading-tight">Versi 1.0.0</p>
        </div>
      </div>

      {/* Admin Profile Section */}
      <div className="d-flex align-items-center mb-4 p-3 rounded-4" style={{
        backgroundColor: '#FCE7E7',
        backdropFilter: 'blur(15px)', border: '1px solid rgba(205, 86, 86, 0.4)'
      }}>
        <div className="position-relative">
          <div className="d-flex align-items-center justify-content-center rounded-circle bg-transparent shadow-lg" style={{
            width: '55px', height: '55px'
          }}>
            <FaUserCircle size={38} style={{ color: '#393E46' }} />
          </div>
          <div className="position-absolute bottom-0 end-0 bg-success rounded-circle" style={{
            width: '14px',
            height: '14px', border: '3px solid white'
          }}></div>
        </div>
        <div className="ms-3">
          <div className="text-black fw-bold" style={{ fontSize: '15px', lineHeight: '1.3' }}>{adminInfo.name || "Admin"}</div>
          <small className="text-black opacity-75" style={{ fontSize: '13px' }}>{adminInfo.email || "Administrator"}</small>
          {/* <small className="text-black opacity-75" style={{ fontSize: '13px' }}>admin opd</small> */}
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="mb-4 flex-grow-1">
        {menuItems.map((item, index) => (
          <Link key={index} to={item.path} className="text-decoration-none d-block mb-2" onClick={() => isMobile &&
            setShowSidebar(false)}
          >
            <div className={`p-3 rounded-4 d-flex align-items-center transition-all ${item.active
              ? 'bg-rose-100 text-dark shadow-lg' : 'text-gray-600 hover:bg-rose-50'}`} style={{
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', cursor: 'pointer', border: item.active ? 'none'
                  : '1px solid rgba(255,255,255,0.1)'
              }} onMouseEnter={(e) => {
                if (!item.active) {
                  e.target.style.backgroundColor = 'rgba(255, 241, 242, 0.8)';
                  e.target.style.transform = 'translateX(10px) scale(1.02)';
                }
              }}
              onMouseLeave={(e) => {
                if (!item.active) {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.transform = 'translateX(0) scale(1)';
                }
              }}>
              <div style={{ color: item.active ? '#CB0404' : 'inherit' }}>
                {item.icon}
              </div>
              <span className="fw-semibold" style={{ fontSize: '15px' }}>{item.label}</span>
            </div>
          </Link>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="mt-auto">
        <Button variant="outline-light"
          className="w-100 d-flex align-items-center justify-content-center p-3 rounded-4 border-2 fw-semibold"
          onClick={handleLogout} style={{
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', borderColor: '#686d76',
            backgroundColor: 'rgba(255,255,255,0.1)', fontSize: '15px', color: '#333'
          }} onMouseEnter={(e) => {
            e.target.style.backgroundColor = 'rgba(255,255,255,0.25)';
            e.target.style.borderColor = '000000';
            e.target.style.transform = 'translateY(-3px) scale(1.02)';
            e.target.style.color = '#000';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'rgba(255,255,255,0.1)';
            e.target.style.borderColor = '#686d76';
            e.target.style.transform = 'translateY(0) scale(1)';
            e.target.style.color = '#333';
          }}
        >
          <FaSignOutAlt className="me-2" />
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Sidebar Offcanvas */}
      <Offcanvas show={showSidebar} onHide={() => setShowSidebar(false)}
        placement="start"
        className="d-lg-none"
        style={{ width: '320px' }}
      >
        <SidebarContent isMobile={true} />
      </Offcanvas>
      <Container fluid className="p-0">
        <Row className="g-0 min-vh-100">
          {/* Desktop Sidebar */}
          <Col lg={3} xl={2} className="d-none d-lg-block position-fixed h-100" style={{ zIndex: 1000 }}>
            <SidebarContent />
          </Col>
          {/* Main Content Area */}
          <Col xs={12} lg={9} xl={10} className="d-lg-block" style={{ marginLeft: 'auto' }}>
            <div className="d-flex flex-column" style={{ backgroundColor: 'rgba(247, 220, 220, 0.2)', minHeight: '100vh' }}>
              <div className="flex-grow-1 p-3 p-md-4">
                {/* Page Header - dengan mobile menu button */}
                <div className="mb-4">
                  <div className="rounded-4 shadow-lg p-4 header-card" style={{
                    background: 'linear-gradient(135deg, #ffffff 0%, #fef7f7 100%)',
                    border: '1px solid rgba(218, 108, 108, 0.1)', boxShadow: '0 8px 30px rgba(218, 108, 108, 0.12)'
                  }}>
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center">
                        {/* Mobile Menu Button */}
                        <Button variant="link" className="d-lg-none p-0 me-3 mobile-menu-btn" onClick={() =>
                          setShowSidebar(true)}
                          style={{ color: '#393E46' }}
                        >
                          <FaBars size={24} />
                        </Button>
                        <div>
                          <p className="mb-1 fw-bold" style={{
                            color: '#DA6C6C', fontSize: '22px',
                            background: 'linear-gradient(135deg, #DA6C6C 0%, #E08080 100%)', WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                          }}>
                            {menuItems.find(item => item.active)?.label || 'Dashboard'}
                          </p>
                          <p className="text-muted mb-0 fw-medium">
                            Selamat datang di panel administrasi
                          </p>
                        </div>
                      </div>
                      <div className="d-none d-md-flex align-items-center">
                        <div className="rounded-circle p-3 icon-bg" style={{
                          background: 'linear-gradient(135deg, #fdeaea 0%, #fddada 100%)',
                          boxShadow: '0 4px 12px rgba(218, 108, 108, 0.15)'
                        }}>
                          {React.cloneElement(
                            menuItems.find(item => item.active)?.icon ||
                            <FaHome size={24} />,
                            { size: 24, className: '', style: { color: '#DA6C6C' } }
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Routes Content */}
                <div className="bg-white rounded-4 shadow-lg p-4 mb-4 border-0" style={{
                  minHeight: '60vh',
                  borderTop: '4px solid #fdf2f8', boxShadow: '0 10px 40px rgba(236, 72, 153, 0.08)'
                }}>
                  <Routes>
                    <Route path="overview" element={<Overview />} />
                    <Route path="bidang-magang" element={<BidangMagang />} />
                    <Route path="data-pendaftaran" element={<DataPendaftaran />} />
                    <Route path="*" element={<Navigate to="overview" replace />} />
                  </Routes>
                </div>
              </div>

              {/* Footer */}
              <footer className="py-4 bg-white shadow-lg px-3 px-md-4 mt-auto" style={{
                borderTop: '1px solid #fce7f3',
                boxShadow: '0 -5px 20px rgba(236, 72, 153, 0.05)'
              }}>
                <Row className="align-items-center">
                  <Col md={6} className="mb-3 mb-md-0">
                    <div className="d-flex align-items-center mb-2">
                      <span className="text-white px-3 py-2 rounded-4 me-3 fw-bold" style={{
                        background: 'linear-gradient(135deg, #c5cbd5 0%, #6e7888 100%)', fontSize: '14px',
                      }}>
                        SI
                      </span>
                      <span className="fw-bold" style={{ color: '#1f2937', fontSize: '16px' }}>
                        Sistem Informasi Magang
                      </span>
                    </div>
                    <p className="text-muted mb-0" style={{ fontSize: '14px' }}>
                      Platform manajemen permohonan magang Dinas Komunikasi dan Informatika DIY.
                    </p>
                  </Col>
                  <Col md={6} className="text-md-end">
                    <small className="text-muted fw-medium">
                      © 2024 Diskominfo DIY - Versi 1.0.0
                    </small>
                  </Col>
                </Row>
              </footer>
            </div>
          </Col>
        </Row>
      </Container>

      <style jsx>
        {
          ` .hover-bg-white-20:hover {
        background-color: rgba(255, 255, 255, 0.2) !important;
      }

      .transition-all {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }

<<<<<<< HEAD
        {/* Main Content */}
        <Col xs={9} className="p-4">
          <Routes>
            <Route path="overview" element={<Overview />} />
            <Route path="bidang-magang" element={<BidangMagang />} />
            <Route path="data-pendaftaran" element={<DataPendaftaran />} />
            <Route path="*" element={<Navigate to="overview" replace />} />
          </Routes>
        </Col>
      </Row>
    </Container>
=======
      @media (max-width: 991.98px) {
        .offcanvas {
          width: 320px !important;
        }
      }

      /* Custom scrollbar */
      .sidebar-scroll::-webkit-scrollbar {
        width: 6px;
      }

      .sidebar-scroll::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 3px;
      }

      .sidebar-scroll::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.3);
        border-radius: 3px;
      }

      .sidebar-scroll::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 255, 255, 0.5);
      }

      /* Smooth animations */
      .btn:hover {
        transform: translateY(-2px) scale(1.02);
        box-shadow: 0 8px 25px rgba(236, 72, 153, 0.2);
      }

      .shadow-lg {
        box-shadow: 0 10px 40px rgba(236, 72, 153, 0.1) !important;
      }

      /* Modern card styles */
      .rounded-4 {
        border-radius: 1.25rem !important;
      }

      /* Glassmorphism effect */
      .glass-effect {
        background: rgba(255, 255, 255, 0.25);
        backdrop-filter: blur(15px);
        border: 1px solid rgba(255, 255, 255, 0.3);
      }

      /* Subtle entrance animations */
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }

        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .bg-white {
        animation: fadeInUp 0.6s ease-out;
      }

      `
        }
      </style>
    </>
>>>>>>> origin/puput
  );
};

export default Dashboard;
