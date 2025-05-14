import React, { useState, useEffect } from "react";
import axios from "axios";
import { Table, Button, Spinner } from "react-bootstrap";

const BidangMagang = () => {
  const [bidangs, setBidangs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch bidang magang data
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

  // Handle delete bidang
  const handleDelete = (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus bidang ini?")) {
      setBidangs(bidangs.filter(bidang => bidang.id !== id));
    }
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
      {/* <h2 style={{ fontWeight: "bold" }} className="mb-4">Bidang Magang</h2> */}

      <div className="mb-3 d-flex justify-content-end">
        <Button variant="primary">Tambah Bidang Baru</Button>
      </div>

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
          {bidangs.length > 0 ? (
            bidangs.map((bidang) => (
              <tr key={bidang.id}>
                <td>{bidang.id}</td>
                <td>{bidang.nama}</td>
                <td>{bidang.deskripsi}</td>
                <td>{bidang.kuota}</td>
                <td>{bidang.publish === "1" ? "Ya" : "Tidak"}</td>
                <td>
                  <Button variant="warning" size="sm" className="me-2">Edit</Button>
                  <Button variant="danger" size="sm" onClick={() => handleDelete(bidang.id)}>Hapus</Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="text-center">Tidak ada data bidang magang</td>
            </tr>
          )}
        </tbody>
      </Table>
    </>
  );
};

export default BidangMagang;
