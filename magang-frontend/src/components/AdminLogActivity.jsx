import { useState, useEffect } from "react";
import { FaSearch, FaEye, FaCheckCircle, FaTimesCircle, FaClock, FaFilter, FaQrcode, FaUser, FaCalendarAlt, FaSignature, FaUpload } from "react-icons/fa";
import { uploadMentorSignature, generateQRCodeUrl } from "../utils/api.js";

const AdminLogActivity = () => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    dateFrom: "",
    dateTo: ""
  });
  const [signatureFile, setSignatureFile] = useState(null);
  const [signaturePreview, setSignaturePreview] = useState(null);

  // API Functions
  const getAllLogActivities = async () => {
    const token = localStorage.getItem("token");
    const response = await fetch("http://localhost:8080/admin/log-activities", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch log activities");
    }

    return await response.json();
  };

  const validateLogActivity = async (id, status, qrCodeUrl = "") => {
    const formData = new FormData();
    formData.append("status", status);
    if (qrCodeUrl) {
      formData.append("qr_code_url", qrCodeUrl);
    }

    const token = localStorage.getItem("token");
    const response = await fetch(`http://localhost:8080/admin/log-activities/${id}/validate`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to validate log activity");
    }

    return await response.json();
  };

  // Load all log activities
  useEffect(() => {
    fetchLogs();
  }, []);

  // Filter logs when filters change
  useEffect(() => {
    filterLogs();
  }, [logs, filters]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await getAllLogActivities();
      setLogs(data);
    } catch (error) {
      console.error("Error fetching logs:", error);
      alert("Gagal memuat data log activity");
    } finally {
      setLoading(false);
    }
  };

  const filterLogs = () => {
    let filtered = [...logs];

    // Filter by search (nama user atau deskripsi)
    if (filters.search) {
      filtered = filtered.filter(log =>
        log.deskripsi.toLowerCase().includes(filters.search.toLowerCase()) ||
        (log.user && log.user.name && log.user.name.toLowerCase().includes(filters.search.toLowerCase())) ||
        (log.user && log.user.email && log.user.email.toLowerCase().includes(filters.search.toLowerCase()))
      );
    }

    // Filter by status
    if (filters.status) {
      filtered = filtered.filter(log => log.status === filters.status);
    }

    // Filter by date range
    if (filters.dateFrom) {
      filtered = filtered.filter(log => new Date(log.tanggal) >= new Date(filters.dateFrom));
    }
    if (filters.dateTo) {
      filtered = filtered.filter(log => new Date(log.tanggal) <= new Date(filters.dateTo + "T23:59:59"));
    }

    setFilteredLogs(filtered);
  };

  const handleSignatureUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSignatureFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setSignaturePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApprove = async (log) => {
    try {
      setLoading(true);

      let mentorSignatureUrl = "https://example.com/mentor-signature.png"; // default
      if (signatureFile) {
        const uploadResult = await uploadMentorSignature(signatureFile);
        mentorSignatureUrl = `http://localhost:8080${uploadResult.url}`;
      }

      const qrCodeUrl = generateQRCodeUrl(mentorSignatureUrl);
      await validateLogActivity(log.id, "disetujui", qrCodeUrl);
      alert("Log activity berhasil disetujui!");
      fetchLogs();
      setShowModal(false);
      setSignatureFile(null);
      setSignaturePreview(null);
    } catch (error) {
      console.error("Error:", error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (log) => {
    if (window.confirm("Yakin ingin menolak log activity ini?")) {
      try {
        setLoading(true);
        await validateLogActivity(log.id, "ditolak");
        alert("Log activity berhasil ditolak!");
        fetchLogs();
        setShowModal(false);
      } catch (error) {
        console.error("Error:", error);
        alert(error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const openModal = (log) => {
    setSelectedLog(log);
    setShowModal(true);
    setSignatureFile(null);
    setSignaturePreview(null);
  };

  const closeModal = () => {
    setSelectedLog(null);
    setShowModal(false);
    setSignatureFile(null);
    setSignaturePreview(null);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "disetujui":
        return <FaCheckCircle className="text-green-500" />;
      case "ditolak":
        return <FaTimesCircle className="text-red-500" />;
      default:
        return <FaClock className="text-yellow-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "disetujui":
        return "bg-green-100 text-green-800";
      case "ditolak":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  const resetFilters = () => {
    setFilters({
      search: "",
      status: "",
      dateFrom: "",
      dateTo: ""
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Kelola Log Activity</h1>
          <p className="text-gray-600">Review dan validasi log activity dari peserta magang</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <FaFilter className="text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900">Filter Data</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaSearch className="inline mr-1" />
                Cari
              </label>
              <input
                type="text"
                placeholder="Cari berdasarkan nama user, email, atau deskripsi..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Semua Status</option>
                <option value="pending">Pending</option>
                <option value="disetujui">Disetujui</option>
                <option value="ditolak">Ditolak</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Dari Tanggal</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sampai Tanggal</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="mt-4">
            <button
              onClick={resetFilters}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Reset Filter
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <FaUser className="text-blue-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Log</p>
                <p className="text-2xl font-semibold text-gray-900">{logs.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <FaClock className="text-yellow-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {logs.filter(log => log.status === "pending").length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <FaCheckCircle className="text-green-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Disetujui</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {logs.filter(log => log.status === "disetujui").length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <FaTimesCircle className="text-red-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Ditolak</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {logs.filter(log => log.status === "ditolak").length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Log Activities Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Log Activity ({filteredLogs.length} dari {logs.length})
            </h2>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Memuat data...</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>Tidak ada data log activity yang ditemukan</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nama User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tanggal
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Deskripsi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      QR Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {log.user ? log.user.name : 'User tidak ditemukan'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {log.user ? log.user.email : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(log.tanggal)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="max-w-xs truncate" title={log.deskripsi}>
                          {log.deskripsi}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(log.status)}`}>
                          {getStatusIcon(log.status)}
                          <span className="ml-1 capitalize">{log.status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.status === "disetujui" && log.qr_code_url ? (
                          <button
                            onClick={() => window.open(log.qr_code_url, '_blank')}
                            className="text-green-600 hover:text-green-800 flex items-center space-x-1"
                          >
                            <FaQrcode />
                            <span>Lihat QR</span>
                          </button>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => openModal(log)}
                          className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                        >
                          <FaEye />
                          <span>Detail</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal Detail */}
        {showModal && selectedLog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 rounded-t-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FaEye className="text-xl" />
                    <h3 className="text-xl font-bold">Detail Log Activity</h3>
                  </div>
                  <button
                    onClick={closeModal}
                    className="text-white hover:text-gray-200 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-white hover:bg-opacity-20 transition-colors"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="p-6">
                {/* User Info Section */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                    <FaUser className="mr-2 text-blue-600" />
                    Informasi Peserta
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Nama Lengkap</label>
                      <p className="text-gray-900 font-medium bg-white px-3 py-2 rounded border">
                        {selectedLog.user ? selectedLog.user.name : 'User tidak ditemukan'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                      <p className="text-gray-900 bg-white px-3 py-2 rounded border">
                        {selectedLog.user ? selectedLog.user.email : '-'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Activity Info Section */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                    <FaCalendarAlt className="mr-2 text-blue-600" />
                    Informasi Kegiatan
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Tanggal</label>
                      <p className="text-gray-900 bg-white px-3 py-2 rounded border font-medium">
                        {formatDate(selectedLog.tanggal)}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Status</label>
                      <div className="bg-white px-3 py-2 rounded border">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedLog.status)}`}>
                          {getStatusIcon(selectedLog.status)}
                          <span className="ml-2 capitalize">{selectedLog.status}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">Deskripsi Kegiatan</label>
                    <div className="bg-white p-4 rounded-lg border shadow-sm">
                      <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">{selectedLog.deskripsi}</p>
                    </div>
                  </div>
                </div>

                {/* Documentation Section */}
                {selectedLog.dokumentasi && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 mb-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-3">Dokumentasi</h4>
                    <div className="bg-white rounded-lg p-4 border shadow-sm">
                      <img
                        src={`http://localhost:8080${selectedLog.dokumentasi}`}
                        alt="Dokumentasi"
                        className="max-w-full h-auto rounded-lg shadow-md"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      />
                      <p className="text-gray-500 text-sm mt-2" style={{ display: 'none' }}>
                        Gagal memuat gambar dokumentasi
                      </p>
                    </div>
                  </div>
                )}

                {/* Signature Upload Section (Only for pending status) */}
                {selectedLog.status === "pending" && (
                  <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg p-4 mb-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                      <FaSignature className="mr-2 text-orange-600" />
                      Paraf PIC (Person In Charge)
                    </h4>
                    <div className="bg-white rounded-lg p-4 border shadow-sm">
                      <label className="block text-sm font-medium text-gray-600 mb-3">
                        Upload Paraf PIC untuk validasi kegiatan
                      </label>

                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-400 transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleSignatureUpload}
                          className="hidden"
                          id="signature-upload"
                        />
                        <label
                          htmlFor="signature-upload"
                          className="cursor-pointer flex flex-col items-center space-y-2"
                        >
                          <FaUpload className="text-3xl text-gray-400" />
                          <span className="text-sm text-gray-600">
                            Klik untuk upload paraf PIC
                          </span>
                          <span className="text-xs text-gray-500">
                            Format: JPG, PNG, maksimal 5MB
                          </span>
                        </label>
                      </div>

                      {signaturePreview && (
                        <div className="mt-4">
                          <label className="block text-sm font-medium text-gray-600 mb-2">Preview Paraf:</label>
                          <div className="border rounded-lg p-2 bg-gray-50 inline-block">
                            <img
                              src={signaturePreview}
                              alt="Preview Paraf"
                              className="max-w-xs max-h-32 rounded"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* QR Code Section (Only for approved status) */}
                {selectedLog.status === "disetujui" && selectedLog.qr_code_url && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 mb-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                      <FaQrcode className="mr-2 text-green-600" />
                      QR Code Validasi
                    </h4>
                    <div className="bg-white rounded-lg p-4 border shadow-sm">
                      <div className="flex items-center space-x-4">
                        <img
                          src={selectedLog.qr_code_url}
                          alt="QR Code"
                          className="w-32 h-32 border-2 border-gray-200 rounded-lg shadow-sm"
                        />
                        <div>
                          <p className="text-gray-700 mb-2">QR Code untuk validasi kegiatan yang telah disetujui</p>
                          <button
                            onClick={() => window.open(selectedLog.qr_code_url, '_blank')}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                          >
                            <FaQrcode />
                            <span>Buka QR Code</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {selectedLog.status === "pending" && (
                <div className="bg-gray-50 px-6 py-4 rounded-b-xl border-t">
                  <div className="flex justify-end space-x-4">
                    <button
                      onClick={closeModal}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
                    >
                      Batal
                    </button>
                    <button
                      onClick={() => handleReject(selectedLog)}
                      disabled={loading}
                      className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg flex items-center space-x-2 disabled:opacity-50 transition-colors"
                    >
                      <FaTimesCircle />
                      <span>Tolak</span>
                    </button>
                    <button
                      onClick={() => handleApprove(selectedLog)}
                      disabled={loading}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg flex items-center space-x-2 disabled:opacity-50 transition-colors"
                    >
                      <FaCheckCircle />
                      <span>{loading ? "Memproses..." : "Setujui"}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminLogActivity;