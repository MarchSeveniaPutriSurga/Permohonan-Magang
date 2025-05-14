import React, { useState, useEffect } from "react";
import { Row, Col, Card, Spinner } from "react-bootstrap";
import { Bar, Pie } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from "chart.js";
import axios from "axios";
import { Link } from "react-router-dom";

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const Overview = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPendaftar: 0,
    magangAktif: 0,
    bidangTersedia: 0,
    distribusiBidangMagang: 0, 
  });
  const [pendaftaranData, setPendaftaranData] = useState(null);
  const [bidangData, setBidangData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Ganti dengan API endpoint
        const statsResponse = await axios.get("http://localhost:8080/api/dashboard/stats");
        const pendaftaranResponse = await axios.get("http://localhost:8080/api/pendaftaran/chart");
        const bidangResponse = await axios.get("http://localhost:8080/api/bidang/distribusi");
        
        setStats(statsResponse.data);
        setPendaftaranData(pendaftaranResponse.data);
        setBidangData(bidangResponse.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Data untuk chart pendaftaran per bulan
  const pendaftaranChartData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"],
    datasets: [
      {
        label: "Pendaftar Magang",
        data: pendaftaranData || [12, 15, 13, 11, 16, 14, 13, 15, 14, 16, 17, 15],
        backgroundColor: "#4e73df",
        borderRadius: 4,
      },
    ],
  };

  // Data untuk distribusi bidang magang (Bidang Magang Populer)
  const bidangChartData = {
    labels: bidangData?.labels || ["IT", "Sosial Media", "Marketing", "System Analyst"],
    datasets: [
      {
        data: bidangData?.data || [45, 25, 15, 15],
        backgroundColor: ["#4e73df", "#1cc88a", "#36b9cc", "#f6c23e"],
        hoverOffset: 4,
      },
    ],
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center my-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <>
      <Row className="mb-4">
        {/* Statistik Utama */}
        <Col md={3} className="mb-4">
          <Card className="border-left-primary shadow h-100 py-2">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="mr-3">
                  <div className="icon-circle bg-primary">
                    <i className="fas fa-users text-white"></i>
                  </div>
                </div>
                <div>
                  <Card.Title className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                    Total Pendaftar
                  </Card.Title>
                  <Card.Text className="h5 mb-0 font-weight-bold text-gray-800">
                    {stats.totalPendaftar}
                  </Card.Text>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3} className="mb-4">
          <Card className="border-left-success shadow h-100 py-2">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="mr-3">
                  <div className="icon-circle bg-success">
                    <i className="fas fa-briefcase text-white"></i>
                  </div>
                </div>
                <div>
                  <Card.Title className="text-xs font-weight-bold text-success text-uppercase mb-1">
                    Magang Aktif
                  </Card.Title>
                  <Card.Text className="h5 mb-0 font-weight-bold text-gray-800">
                    {stats.magangAktif}
                  </Card.Text>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3} className="mb-4">
          <Card className="border-left-info shadow h-100 py-2">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="mr-3">
                  <div className="icon-circle bg-info">
                    <i className="fas fa-clipboard-list text-white"></i>
                  </div>
                </div>
                <div>
                  <Card.Title className="text-xs font-weight-bold text-info text-uppercase mb-1">
                    Bidang Tersedia
                  </Card.Title>
                  <Card.Text className="h5 mb-0 font-weight-bold text-gray-800">
                    {stats.bidangTersedia}
                  </Card.Text>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3} className="mb-4">
          <Link to="/dashboard/bidang-magang" className="text-decoration-none"> 
            {/* Membungkus card dengan Link */}
            <Card className="border-left-warning shadow h-100 py-2">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="mr-3">
                    <div className="icon-circle bg-warning">
                      <i className="fas fa-clipboard-list text-white"></i>
                    </div>
                  </div>
                  <div>
                    <Card.Title className="text-xs font-weight-bold text-warning text-uppercase mb-1">
                      Distribusi Bidang Magang
                    </Card.Title>
                    <Card.Text className="h5 mb-0 font-weight-bold text-gray-800">
                      {stats.distribusiBidangMagang}
                    </Card.Text>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Link>
        </Col>
      </Row>

      {/* Charts */}
      <Row>
        <Col md={8}>
          <Card className="shadow mb-4">
            <Card.Header className="py-3 d-flex flex-row align-items-center justify-content-between">
              <h6 className="m-0 font-weight-bold text-primary">
                Pendaftaran Magang Per Bulan
              </h6>
            </Card.Header>
            <Card.Body>
              <Bar 
                data={pendaftaranChartData} 
                options={{ 
                  responsive: true,
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        stepSize: 1
                      }
                    }
                  }
                }} 
              />
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4}>
          <Card className="shadow mb-4">
            <Card.Header className="py-3 d-flex flex-row align-items-center justify-content-between">
              <h6 className="m-0 font-weight-bold text-primary">
                Bidang Magang Populer
              </h6>
            </Card.Header>
            <Card.Body>
              <div className="chart-pie pt-4 pb-2">
                <Pie 
                  data={bidangChartData} 
                  options={{ 
                    responsive: true,
                    maintainAspectRatio: false
                  }} 
                />
              </div>
              <div className="mt-4 text-center small">
                {bidangChartData.labels.map((label, index) => (
                  <span className="mr-2" key={index}>
                    <i className={`fas fa-circle text-${['primary', 'success', 'info', 'warning'][index]}`}></i> {label}
                  </span>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default Overview;
