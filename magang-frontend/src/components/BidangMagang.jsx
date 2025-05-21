import React, { useState, useEffect } from "react";
import axios from "axios";
import { Table, Button, Spinner, Modal, Form } from "react-bootstrap";

const BidangMagang = () => {
  const [bidangs, setBidangs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    nama: "",
    deskripsi: "",
    kuota: 1,
    publish: "1"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Konfigurasi axios untuk menyertakan token di setiap request
  const axiosConfig = {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
      "Content-Type": "application/json"
    }
  };

  // Fetch bidang magang data
  const fetchBidangs = () => {
    setLoading(true);
    axios
      .get("http://localhost:8080/api/bidangs", axiosConfig)
      .then((response) => {
        setBidangs(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Terjadi error:", error);
        setLoading(false);
        // Jika error unauthorized, mungkin token expired
        if (error.response && error.response.status === 401) {
          alert("Sesi habis, silahkan login kembali");
          // Redirect ke halaman login jika diperlukan
          // window.location.href = "/login";
        }
      });
  };

  useEffect(() => {
    fetchBidangs();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "kuota" ? parseInt(value) : value,
    });
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      nama: "",
      deskripsi: "",
      kuota: 1,
      publish: "1"
    });
    setEditingId(null);
  };

  // Open modal for adding new bidang
  const handleAddBidang = () => {
    resetForm();
    setShowModal(true);
  };

  // Open modal for editing bidang
  const handleEdit = (bidang) => {
    setFormData({
      nama: bidang.nama,
      deskripsi: bidang.deskripsi,
      kuota: bidang.kuota,
      publish: bidang.publish
    });
    setEditingId(bidang.id);
    setShowModal(true);
  };

  // Save bidang (create or update)
  const handleSave = () => {
    setIsSubmitting(true);
    
    if (editingId) {
      // Update existing bidang
      axios
        .put(`http://localhost:8080/api/bidangs/${editingId}`, formData, axiosConfig)
        .then(() => {
          fetchBidangs();
          setShowModal(false);
          setIsSubmitting(false);
          resetForm();
        })
        .catch((error) => {
          console.error("Error updating bidang:", error);
          setIsSubmitting(false);
          if (error.response && error.response.status === 401) {
            alert("Sesi habis, silahkan login kembali");
          }
        });
    } else {
      // Create new bidang
      axios
        .post("http://localhost:8080/api/bidangs", formData, axiosConfig)
        .then(() => {
          fetchBidangs();
          setShowModal(false);
          setIsSubmitting(false);
          resetForm();
        })
        .catch((error) => {
          console.error("Error creating bidang:", error);
          setIsSubmitting(false);
          if (error.response && error.response.status === 401) {
            alert("Sesi habis, silahkan login kembali");
          }
        });
    }
  };

  // Handle delete bidang
  const handleDelete = (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus bidang ini?")) {
      axios
        .delete(`http://localhost:8080/api/bidangs/${id}`, axiosConfig)
        .then(() => {
          fetchBidangs(); // Refresh data after deletion
        })
        .catch((error) => {
          console.error("Error deleting bidang:", error);
          if (error.response && error.response.status === 401) {
            alert("Sesi habis, silahkan login kembali");
          }
        });
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
      <h2 style={{ fontWeight: "bold" }} className="mb-4">Bidang Magang</h2>
      <div className="mb-3 d-flex justify-content-end">
        <Button variant="primary" onClick={handleAddBidang}>Tambah Bidang Baru</Button>
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
                  <Button variant="warning" size="sm" className="me-2" onClick={() => handleEdit(bidang)}>Edit</Button>
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

      {/* Modal for Add/Edit Bidang Magang */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editingId ? "Edit Bidang Magang" : "Tambah Bidang Magang Baru"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Nama Bidang</Form.Label>
              <Form.Control
                type="text"
                name="nama"
                value={formData.nama}
                onChange={handleInputChange}
                placeholder="Masukkan nama bidang"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Deskripsi</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="deskripsi"
                value={formData.deskripsi}
                onChange={handleInputChange}
                placeholder="Masukkan deskripsi bidang"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Kuota</Form.Label>
              <Form.Control
                type="number"
                name="kuota"
                value={formData.kuota}
                onChange={handleInputChange}
                min={1}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Status Publish</Form.Label>
              <Form.Select
                name="publish"
                value={formData.publish}
                onChange={handleInputChange}
              >
                <option value="1">Ya</option>
                <option value="0">Tidak</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Batal
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSave} 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-1"
                />
                Menyimpan...
              </>
            ) : (
              editingId ? "Perbarui" : "Simpan"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default BidangMagang;