import React, { useState } from "react";
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

const Dashboard = () => {
  const location = useLocation();
  const [showSidebar, setShowSidebar] = useState(false);

  const menuItems = [
    {
      path: "/dashboard/overview",
      label: "Overview",
      icon: <FaHome className="me-3" />,
      active: location.pathname === '/dashboard/overview'
    },
    {
      path: "/dashboard/bidang-magang",
      label: "Bidang Magang",
      icon: <FaBriefcase className="me-3" />,
      active: location.pathname.includes('bidang-magang')
    },
    {
      path: "/dashboard/data-pendaftaran",
      label: "Data Pendaftaran",
      icon: <FaUsers className="me-3" />,
      active: location.pathname.includes('data-pendaftaran')
    }
  ];

  const handleLogout = () => {
    // Handle logout logic here
    alert('Logout functionality here');
  };

  const SidebarContent = ({ isMobile = false }) => (
    <div className={`h-100 ${isMobile ? 'p-3' : 'p-4'}`}
      style={{ background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)' }}>

      {/* Header with close button for mobile */}
      {isMobile && (
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="text-white mb-0">Menu</h5>
          <Button
            variant="link"
            className="text-white p-0"
            onClick={() => setShowSidebar(false)}
          >
            <FaTimes size={20} />
          </Button>
        </div>
      )}

      {/* Admin Profile Section */}
      <div className="d-flex align-items-center mb-4 p-3 rounded-3"
        style={{ backgroundColor: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="position-relative">
          <FaUserCircle size={50} className="text-white" />
          <div className="position-absolute bottom-0 end-0 bg-success rounded-circle"
            style={{ width: '12px', height: '12px', border: '2px solid white' }}></div>
        </div>
        <div className="ms-3">
          <div className="text-white fw-bold fs-5">Admin</div>
          <small className="text-white-50">Administrator</small>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="mb-4">
        {menuItems.map((item, index) => (
          <Link
            key={index}
            to={item.path}
            className="text-decoration-none d-block mb-2"
            onClick={() => isMobile && setShowSidebar(false)}
          >
            <div className={`p-3 rounded-3 d-flex align-items-center transition-all ${item.active
              ? 'bg-white text-dark shadow-sm'
              : 'text-white hover-bg-white-10'
              }`}
              style={{
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                if (!item.active) {
                  e.target.style.backgroundColor = 'rgba(255,255,255,0.08)';
                  e.target.style.transform = 'translateX(5px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!item.active) {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.transform = 'translateX(0)';
                }
              }}>
              {item.icon}
              <span className="fw-medium">{item.label}</span>
            </div>
          </Link>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="mt-auto">
        <Button
          variant="outline-light"
          className="w-100 d-flex align-items-center justify-content-center p-3 rounded-3 border-2"
          onClick={handleLogout}
          style={{
            transition: 'all 0.3s ease',
            borderColor: 'rgba(255,255,255,0.2)'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = 'rgba(255,255,255,0.08)';
            e.target.style.borderColor = 'rgba(255,255,255,0.5)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'transparent';
            e.target.style.borderColor = 'rgba(255,255,255,0.2)';
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
      <Offcanvas
        show={showSidebar}
        onHide={() => setShowSidebar(false)}
        placement="start"
        className="d-lg-none"
        style={{ width: '280px' }}
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

            {/* Content wrapper dengan flexbox untuk sticky footer */}
            <div className="d-flex flex-column" style={{
              backgroundColor: '#f8f9ff',
              minHeight: '100vh'
            }}>

              {/* Main content yang akan grow untuk push footer ke bawah */}
              <div className="flex-grow-1 p-3 p-md-4">

                {/* Page Header - dengan mobile menu button */}
                <div className="mb-4">
                  <div className="bg-white rounded-4 shadow-sm p-4">
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center">
                        {/* Mobile Menu Button */}
                        <Button
                          variant="link"
                          className="d-lg-none p-0 text-dark me-3"
                          onClick={() => setShowSidebar(true)}
                        >
                          <FaBars size={24} />
                        </Button>
                        <div>
                          <h2 className="text-dark mb-1 fw-bold">
                            {menuItems.find(item => item.active)?.label || 'Dashboard'}
                          </h2>
                          <p className="text-muted mb-0">
                            Selamat datang di panel administrasi
                          </p>
                        </div>
                      </div>
                      <div className="d-none d-md-flex align-items-center">
                        <div className="bg-primary bg-opacity-10 rounded-circle p-3">
                          {menuItems.find(item => item.active)?.icon || <FaHome size={24} className="text-primary" />}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Routes Content */}
                <div className="bg-white rounded-4 shadow-sm p-4 mb-4" style={{ minHeight: '50vh' }}>
                  <Routes>
                    <Route path="overview" element={<Overview />} />
                    <Route path="bidang-magang" element={<BidangMagang />} />
                    <Route path="data-pendaftaran" element={<DataPendaftaran />} />
                    <Route path="*" element={<Navigate to="overview" replace />} />
                  </Routes>
                </div>
              </div>

              {/* Footer - akan selalu berada di bawah */}
              <footer className="py-4 border-top bg-transparent px-3 px-md-4 mt-auto">
                <Row className="align-items-center">
                  <Col md={6} className="mb-3 mb-md-0">
                    <div className="d-flex align-items-center mb-2">
                      <span className="bg-dark text-white px-2 py-1 rounded me-2" style={{ fontSize: '12px' }}>
                        SI
                      </span>
                      <span className="fw-bold text-dark">Sistem Informasi Magang</span>
                    </div>
                    <p className="text-muted mb-0" style={{ fontSize: '14px' }}>
                      Platform manajemen magang Dinas Komunikasi dan Informatika DIY.
                    </p>
                  </Col>
                </Row>
              </footer>
            </div>
          </Col>
        </Row>
      </Container>

      <style jsx>{`
        .hover-bg-white-10:hover {
          background-color: rgba(255,255,255,0.08) !important;
        }
        
        .transition-all {
          transition: all 0.3s ease;
        }

        @media (max-width: 991.98px) {
          .offcanvas {
            width: 280px !important;
          }
        }

        /* Custom scrollbar */
        .sidebar-scroll::-webkit-scrollbar {
          width: 4px;
        }
        
        .sidebar-scroll::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.1);
        }
        
        .sidebar-scroll::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.3);
          border-radius: 2px;
        }
        
        .sidebar-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,0.5);
        }
      `}</style>
    </>
  );
};

export default Dashboard;