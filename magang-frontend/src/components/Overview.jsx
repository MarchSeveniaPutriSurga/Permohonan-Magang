import React, { useState, useEffect } from "react";
import { Row, Col, Card, Spinner } from "react-bootstrap";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Link } from "react-router-dom";
import {
  getDashboardStats,
  getPendaftaranChart,
  getDistribusiBidangMagang,
} from "../utils/api.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Overview = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPendaftar: 0,
    magangAktif: 0,
    bidangTersedia: 0,
    distribusiBidangMagang: 0,
  });
  const [pendaftaranData, setPendaftaranData] = useState([]);
  const [bidangData, setBidangData] = useState({ labels: [], data: [] });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsRes = await getDashboardStats();
        console.log("statsRes:", statsRes);
        const chartRes = await getPendaftaranChart();
        console.log("chartRes:", chartRes);
        const distribusiRes = await getDistribusiBidangMagang();
        console.log("distribusiRes:", distribusiRes);

        setStats(statsRes);
        setPendaftaranData(chartRes);
        setBidangData(distribusiRes);
        setLoading(false);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const bulanLabels = [
    "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
    "Jul", "Agu", "Sep", "Okt", "Nov", "Des"
  ];

  const pendaftaranChartData = {
    labels: bulanLabels,
    datasets: [
      {
        label: "Pendaftar Magang",
        data: pendaftaranData,
        backgroundColor: "#4e73df",
        borderRadius: 4,
      },
    ],
  };

  const bidangChartData = {
    labels: bidangData.labels,
    datasets: [
      {
        data: bidangData.data,
        backgroundColor: ["#4e73df", "#1cc88a", "#36b9cc", "#f6c23e", "#e74a3b", "#858796"],
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
            <Card className="border-left-warning shadow h-100 py-2">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="mr-3">
                    <div className="icon-circle bg-warning">
                      <i className="fas fa-chart-pie text-white"></i>
                    </div>
                  </div>
                  <div>
                    <Card.Title className="text-xs font-weight-bold text-warning text-uppercase mb-1">
                      Total Bidang Magang
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

      <Row>
        <Col md={8}>
          <Card className="shadow mb-4">
            <Card.Header className="py-3">
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
                      ticks: { stepSize: 1 },
                    },
                  },
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                }}
              />
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="shadow mb-4">
            <Card.Header className="py-3">
              <h6 className="m-0 font-weight-bold text-primary">
                Bidang Magang Populer
              </h6>
            </Card.Header>
            <Card.Body>
              <div
                className="chart-pie pt-3 pb-3"
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '340px',
                  width: '100%',
                }}
              >
                <Pie
                  data={bidangChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                      legend: {
                        display: false,
                      },
                      tooltip: {
                        enabled: true,
                      },
                    },
                  }}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>


      </Row>
    </>
  );
};

export default Overview;
