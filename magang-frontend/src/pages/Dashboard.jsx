import React from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { Routes, Route, Link, Navigate, useLocation } from "react-router-dom";
import Overview from "../components/Overview";
import BidangMagang from "../components/BidangMagang";

const Dashboard = () => {
  const location = useLocation();

  return (
    <Container fluid className="p-0">
      <Row className="g-0">
        {/* Sidebar */}
        <Col xs={3} className="bg-dark text-white p-4" style={{ minHeight: "100vh" }}>
          <div className="d-flex align-items-center mb-4">
            <Button variant="secondary" className="rounded-circle" style={{ width: "50px", height: "50px" }}>
              A
            </Button>
            <span className="ms-3" style={{ fontSize: "18px", fontWeight: "bold" }}>Admin</span>
          </div>
          
          <div className="d-flex flex-column">
            <Link to="/dashboard/overview" className="text-decoration-none">
              <Button 
                variant="link" 
                className={`text-white mb-3 text-start ${location.pathname === '/dashboard/overview' ? 'active' : ''}`}
              >
                Overview
              </Button>
            </Link>
            
            <Link to="/dashboard/bidang-magang" className="text-decoration-none">
              <Button 
                variant="link" 
                className={`text-white mb-3 text-start ${location.pathname.includes('bidang-magang') ? 'active' : ''}`}
              >
                Bidang Magang
              </Button>
            </Link>
            
            <Link to="/pendaftaran-magang" className="text-decoration-none">
              <Button variant="link" className="text-white mb-3 text-start">
                Pendaftaran Magang
              </Button>
            </Link>
            
            <Button 
              variant="link" 
              className="text-white text-start"
              onClick={() => {
                // Handle logout logic here
                alert('Logout functionality here');
              }}
            >
              Logout
            </Button>
          </div>
        </Col>

        {/* Main Content */}
        <Col xs={9} className="p-4">

          <Routes>
          <Route path="overview" element={<Overview />} />
          <Route path="bidang-magang" element={<BidangMagang />} />
          <Route path="*" element={<Navigate to="overview" replace />} />
          </Routes>

        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;