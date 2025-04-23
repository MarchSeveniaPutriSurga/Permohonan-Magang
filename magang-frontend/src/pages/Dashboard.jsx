import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Container,
  Row,
  Col,
  Button,
  Card,
  Table,
} from "react-bootstrap";

const Dashboard = () => {
  // State untuk data yang dimuat
  const [bidangs, setBidangs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("http://localhost:8080/api/bidangs")
      .then((response) => {
        setBidangs(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Terjadi error:", error);
        setLoading(false);
      });
  }, []);

  return (
    <Container fluid className="mt-4">
      <Row>
        {/* Sidebar */}
        <Col xs={3} className="bg-dark text-white p-4" style={{ minHeight: "100vh" }}>
          {/* Profil Admin */}
          <div className="d-flex align-items-center mb-4">
            <Button variant="secondary" className="rounded-circle" style={{ width: "50px", height: "50px" }}>
              A
            </Button>
            <span className="ms-3" style={{ fontSize: "18px", fontWeight: "bold" }}>Admin</span>
          </div>
          
          {/* Sidebar Links */}
          <div className="d-flex flex-column">
            <Button variant="link" className="text-white mb-3 text-start" href="/admin">Dashboard</Button>
            <Button variant="link" className="text-white mb-3 text-start" href="/">Pendaftaran Magang</Button>
            <Button variant="link" className="text-white mb-3 text-start" href="/settings">Settings</Button>
            <Button variant="link" className="text-white text-start" onClick={() => alert('Logout functionality here')}>Logout</Button>
          </div>
        </Col>

        {/* Content area */}
        <Col xs={9}>
          <h2 style={{ fontWeight: "bold" }}>Overview</h2>
          
          {/* Loading Spinner */}
          {loading ? (
            <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <>
              <Row className="mb-4">
                {/* Card - Jumlah Anak Magang */}
                <Col md={3} className="mb-4">
                  <Card className="card-statistic">
                    <Card.Body>
                      <Card.Title>Total Anak Magang</Card.Title>
                      <Card.Text>3050</Card.Text>
                    </Card.Body>
                  </Card>
                </Col>

                {/* Card - Jumlah Aktif */}
                <Col md={3} className="mb-4">
                  <Card className="card-statistic">
                    <Card.Body>
                      <Card.Title>Jumlah Aktif</Card.Title>
                      <Card.Text>1500</Card.Text>
                    </Card.Body>
                  </Card>
                </Col>

                {/* Card - Jumlah Pelamar */}
                <Col md={3} className="mb-4">
                  <Card className="card-statistic">
                    <Card.Body>
                      <Card.Title>Jumlah Pelamar</Card.Title>
                      <Card.Text>5000</Card.Text>
                    </Card.Body>
                  </Card>
                </Col>

                {/* Card - Jumlah Diterima */}
                <Col md={3} className="mb-4">
                  <Card className="card-statistic">
                    <Card.Body>
                      <Card.Title>Jumlah Diterima</Card.Title>
                      <Card.Text>1200</Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              <h3 style={{ fontWeight: "bold" }}>Daftar Bidang Magang</h3>
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nama</th>
                    <th>Deskripsi</th>
                    <th>Kuota</th>
                    <th>Publish</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {bidangs.map((bidang) => (
                    <tr key={bidang.id}>
                      <td>{bidang.id}</td>
                      <td>{bidang.nama}</td>
                      <td>{bidang.deskripsi}</td>
                      <td>{bidang.kuota}</td>
                      <td>{bidang.publish === "1" ? "Ya" : "Tidak"}</td>
                      <td>
                        <Button variant="danger">Hapus</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
