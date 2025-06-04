import { useState, useEffect } from "react";
import { FaCalendarAlt, FaFileUpload, FaPlus, FaEdit, FaTrash, FaQrcode, FaCheckCircle, FaTimesCircle, FaClock, FaFilePdf } from "react-icons/fa";
import Navbar from "../../components/Navbar";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const LogActivity = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        tanggal: "",
        deskripsi: "",
        dokumentasi: null
    });
    const [showForm, setShowForm] = useState(false);
    const [editingLog, setEditingLog] = useState(null);

    // API Functions
    const createLogActivity = async (data) => {
        const formData = new FormData();
        formData.append("tanggal", data.tanggal);
        formData.append("deskripsi", data.deskripsi);
        if (data.dokumentasi) {
            formData.append("dokumentasi", data.dokumentasi);
        }

        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:8080/api/log-activities", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to create log activity");
        }

        return await response.json();
    };

    const getUserLogActivities = async () => {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:8080/api/log-activities", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error("Failed to fetch log activities");
        }

        return await response.json();
    };

    const updateLogActivity = async (id, data) => {
        const formData = new FormData();
        formData.append("tanggal", data.tanggal);
        formData.append("deskripsi", data.deskripsi);
        if (data.dokumentasi) {
            formData.append("dokumentasi", data.dokumentasi);
        }

        const token = localStorage.getItem("token");
        const response = await fetch(`http://localhost:8080/api/log-activities/${id}`, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to update log activity");
        }

        return await response.json();
    };

    const deleteLogActivity = async (id) => {
        const token = localStorage.getItem("token");
        const response = await fetch(`http://localhost:8080/api/log-activities/${id}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to delete log activity");
        }

        return await response.json();
    };

    // Load log activities
    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const data = await getUserLogActivities();
            setLogs(data);
        } catch (error) {
            console.error("Error fetching logs:", error);
            alert("Gagal memuat data log activity");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);

            if (editingLog) {
                await updateLogActivity(editingLog.id, formData);
                setEditingLog(null);
                alert("Log activity berhasil diupdate!");
            } else {
                await createLogActivity(formData);
                alert("Log activity berhasil dibuat!");
            }

            setFormData({ tanggal: "", deskripsi: "", dokumentasi: null });
            setShowForm(false);
            fetchLogs();
        } catch (error) {
            console.error("Error:", error);
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (log) => {
        setEditingLog(log);
        setFormData({
            tanggal: log.tanggal.split("T")[0], // Format untuk input date
            deskripsi: log.deskripsi,
            dokumentasi: null
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Yakin ingin menghapus log activity ini?")) {
            try {
                setLoading(true);
                await deleteLogActivity(id);
                alert("Log activity berhasil dihapus!");
                fetchLogs();
            } catch (error) {
                console.error("Error:", error);
                alert(error.message);
            } finally {
                setLoading(false);
            }
        }
    };

    const resetForm = () => {
        setFormData({ tanggal: "", deskripsi: "", dokumentasi: null });
        setEditingLog(null);
        setShowForm(false);
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

    // Function to convert image URL to base64
    const getImageBase64 = async (url) => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(blob);
            });
        } catch (error) {
            console.error('Error converting image to base64:', error);
            return null;
        }
    };

    // Function to download PDF
    const downloadPDF = async () => {
        try {
            setLoading(true);

            // Filter hanya log yang disetujui dan memiliki QR code
            const approvedLogs = logs.filter(log => log.status === "disetujui" && log.qr_code_url);

            if (approvedLogs.length === 0) {
                alert("Tidak ada log activity yang disetujui dengan QR Code untuk diunduh");
                return;
            }

            const pdf = new jsPDF();

            // Header
            pdf.setFontSize(18);
            pdf.setFont("helvetica", "bold");
            pdf.text("Log Activity Harian", 20, 20);

            pdf.setFontSize(12);
            pdf.setFont("helvetica", "normal");
            pdf.text(`Tanggal Cetak: ${new Date().toLocaleDateString("id-ID")}`, 20, 30);

            // Prepare table data
            const tableData = [];

            for (const log of approvedLogs) {
                tableData.push([
                    formatDate(log.tanggal),
                    log.deskripsi,
                    log.qr_code_url ? 'QR Code tersedia' : 'Tidak tersedia'
                ]);
            }

            // Prepare table data with QR images
            const tableDataWithImages = [];

            for (const log of approvedLogs) {
                let qrImageBase64 = null;

                // Try to get QR code image
                if (log.qr_code_url) {
                    try {
                        qrImageBase64 = await getImageBase64(log.qr_code_url);
                    } catch (error) {
                        console.error('Error loading QR code:', error);
                    }
                }

                tableDataWithImages.push({
                    tanggal: formatDate(log.tanggal),
                    deskripsi: log.deskripsi,
                    qrImage: qrImageBase64
                });
            }

            // Create table
            autoTable(pdf, {
                head: [['Tanggal', 'Deskripsi', 'QR Code']],
                body: tableDataWithImages.map(row => [row.tanggal, row.deskripsi, '']),
                startY: 40,
                styles: {
                    fontSize: 10,
                    cellPadding: 5,
                    minCellHeight: 25, // Minimum tinggi sel untuk QR code
                },
                headStyles: {
                    fillColor: [52, 144, 220], // Warna biru untuk header
                    textColor: 255,
                    fontSize: 11,
                    fontStyle: 'bold'
                },
                columnStyles: {
                    0: { cellWidth: 40, valign: 'middle' }, // Tanggal
                    1: { cellWidth: 120, valign: 'middle' }, // Deskripsi
                    2: { cellWidth: 30, halign: 'center', valign: 'middle' }, // QR Code
                },
                bodyStyles: {
                    valign: 'middle'
                },
                didDrawCell: function (data) {
                    // Add QR code images
                    if (data.column.index === 2 && data.cell.section === 'body') {
                        const rowData = tableDataWithImages[data.row.index];
                        if (rowData && rowData.qrImage) {
                            try {
                                const imgWidth = 22;
                                const imgHeight = 22;
                                const x = data.cell.x + (data.cell.width - imgWidth) / 2;
                                const y = data.cell.y + (data.cell.height - imgHeight) / 2;

                                pdf.addImage(rowData.qrImage, 'PNG', x, y, imgWidth, imgHeight);
                            } catch (error) {
                                console.error('Error adding QR image to PDF:', error);
                            }
                        }
                    }
                }
            });

            // Save PDF
            pdf.save(`log-activity-${new Date().toISOString().split('T')[0]}.pdf`);

        } catch (error) {
            console.error("Error generating PDF:", error);
            alert("Gagal membuat PDF: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-20">
            <Navbar />
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Log Activity Harian</h1>
                    <p className="text-gray-600">Catat kegiatan harian magang Anda di sini</p>
                </div>

                {/* Action Buttons */}
                <div className="mb-6 flex flex-wrap gap-4">
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors"
                    >
                        <FaPlus />
                        <span>Tambah Log Activity</span>
                    </button>

                    <button
                        onClick={downloadPDF}
                        disabled={loading || logs.filter(log => log.status === "disetujui" && log.qr_code_url).length === 0}
                        className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <FaFilePdf />
                        <span>Download PDF</span>
                    </button>
                </div>

                {/* Form */}
                {showForm && (
                    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold text-gray-900">
                                {editingLog ? "Edit Log Activity" : "Tambah Log Activity Baru"}
                            </h2>
                            <button
                                onClick={resetForm}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <FaCalendarAlt className="inline mr-2" />
                                    Tanggal
                                </label>
                                <input
                                    type="date"
                                    required
                                    value={formData.tanggal}
                                    onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Deskripsi Kegiatan
                                </label>
                                <textarea
                                    required
                                    rows={4}
                                    value={formData.deskripsi}
                                    onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                                    placeholder="Jelaskan kegiatan yang dilakukan hari ini..."
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <FaFileUpload className="inline mr-2" />
                                    Dokumentasi (Opsional)
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setFormData({ ...formData, dokumentasi: e.target.files[0] })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <p className="text-sm text-gray-500 mt-1">Format: JPG, PNG, GIF (Max: 5MB)</p>
                            </div>

                            <div className="flex space-x-4">
                                <button
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg disabled:opacity-50 transition-colors"
                                >
                                    {loading ? "Menyimpan..." : editingLog ? "Update" : "Simpan"}
                                </button>
                                <button
                                    onClick={resetForm}
                                    className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
                                >
                                    Batal
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Log Activities List */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-900">Riwayat Log Activity</h2>
                    </div>

                    {loading ? (
                        <div className="p-8 text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="mt-4 text-gray-600">Memuat data...</p>
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            <p>Belum ada log activity yang dibuat</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Tanggal
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Deskripsi
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Dokumentasi
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
                                    {logs.map((log) => (
                                        <tr key={log.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {formatDate(log.tanggal)}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                <div className="max-w-xs truncate" title={log.deskripsi}>
                                                    {log.deskripsi}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {log.dokumentasi ? (
                                                    <a
                                                        href={`http://localhost:8080${log.dokumentasi}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 hover:text-blue-800"
                                                    >
                                                        Lihat File
                                                    </a>
                                                ) : (
                                                    <span className="text-gray-500">-</span>
                                                )}
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
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleEdit(log)}
                                                        className="text-blue-600 hover:text-blue-800"
                                                        title="Edit"
                                                    >
                                                        <FaEdit />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(log.id)}
                                                        className="text-red-600 hover:text-red-800"
                                                        title="Hapus"
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LogActivity;