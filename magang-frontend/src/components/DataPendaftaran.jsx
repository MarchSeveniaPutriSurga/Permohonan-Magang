import React, { useEffect, useState } from "react";

const API_URL = "http://localhost:8080/api";

const statusOptions = ["Pending", "Aktif", "Ditolak", "Selesai"];
const statusVariant = {
    Pending: "bg-amber-100 text-amber-800",
    Aktif: "bg-green-100 text-green-800",
    Ditolak: "bg-red-100 text-red-800",
    Selesai: "bg-gray-100 text-gray-800",
};

// Helper: Format tanggal ke DD MMM YYYY
const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

function DataPendaftaran() {
    const [pendaftar, setPendaftar] = useState([]);
    const [bidangMap, setBidangMap] = useState({});
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState({ type: "", message: "" });
    const [searchTerm, setSearchTerm] = useState("");
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

    const fetchBidangs = async () => {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/bidangs`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Gagal ambil data bidang");
        const data = await res.json();
        const map = {};
        data.forEach((item) => {
            map[item.id] = item.nama;
        });
        setBidangMap(map);
    };

    const fetchPendaftar = async (resetSearch = false) => {
        setLoading(true);

        // Reset search term when param is true
        if (resetSearch) {
            setSearchTerm("");
            // Reset sorting as well to default state
            setSortConfig({ key: null, direction: 'ascending' });
        }

        try {
            const token = localStorage.getItem("token");

            await fetchBidangs();

            const res = await fetch(`${API_URL}/magang`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error("Gagal ambil data pendaftar");
            const data = await res.json();
            setPendaftar(data);
        } catch (err) {
            setAlert({ type: "error", message: err.message });
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id, newStatus) => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_URL}/magang/${id}/status`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ status_magang: newStatus }),
            });
            if (!res.ok) throw new Error("Gagal update status");
            setAlert({ type: "success", message: "Status berhasil diperbarui" });
            fetchPendaftar();
        } catch (err) {
            setAlert({ type: "error", message: err.message });
        }
    };

    useEffect(() => {
        fetchPendaftar(false);
    }, []);

    // Sorting function
    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    // Apply sorting
    const sortedPendaftar = React.useMemo(() => {
        if (!sortConfig.key) return pendaftar;

        return [...pendaftar].sort((a, b) => {
            if (a[sortConfig.key] < b[sortConfig.key]) {
                return sortConfig.direction === 'ascending' ? -1 : 1;
            }
            if (a[sortConfig.key] > b[sortConfig.key]) {
                return sortConfig.direction === 'ascending' ? 1 : -1;
            }
            return 0;
        });
    }, [pendaftar, sortConfig]);

    // Filter data based on search term
    const filteredPendaftar = sortedPendaftar.filter(item =>
        item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.instansi.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.no_hp.includes(searchTerm) ||
        (bidangMap[item.bidang_magang_id] || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-white rounded-lg shadow-md">
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-semibold text-gray-800">Data Pendaftaran Magang</h1>
                    <button
                        onClick={() => fetchPendaftar(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-150 flex items-center"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Refresh
                    </button>
                </div>

                {/* Alert Messages */}
                {alert.message && (
                    <div className={`mb-4 p-4 rounded-md ${alert.type === "success" ? "bg-green-50 text-green-800 border-l-4 border-green-400" :
                        "bg-red-50 text-red-800 border-l-4 border-red-400"
                        }`}>
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                {alert.type === "success" ? (
                                    <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                ) : (
                                    <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                )}
                            </div>
                            <div className="ml-3">
                                <p className="text-sm">{alert.message}</p>
                            </div>
                            <div className="ml-auto pl-3">
                                <div className="-mx-1.5 -my-1.5">
                                    <button
                                        onClick={() => setAlert({ type: "", message: "" })}
                                        className={`inline-flex rounded-md p-1.5 ${alert.type === "success" ? "text-green-500 hover:bg-green-100" : "text-red-500 hover:bg-red-100"
                                            }`}
                                    >
                                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Search Bar */}
                <div className="mb-4">
                    <div className="relative">
                        <input
                            type="text"
                            className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Cari nama, instansi, atau bidang..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-16">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        #
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                        onClick={() => requestSort('nama')}
                                    >
                                        <div className="flex items-center">
                                            Nama
                                            {sortConfig.key === 'nama' && (
                                                <span className="ml-1">
                                                    {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                                                </span>
                                            )}
                                        </div>
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                        onClick={() => requestSort('instansi')}
                                    >
                                        <div className="flex items-center">
                                            Instansi
                                            {sortConfig.key === 'instansi' && (
                                                <span className="ml-1">
                                                    {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                                                </span>
                                            )}
                                        </div>
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        No HP
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                        onClick={() => requestSort('start_date')}
                                    >
                                        <div className="flex items-center">
                                            Periode
                                            {sortConfig.key === 'start_date' && (
                                                <span className="ml-1">
                                                    {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                                                </span>
                                            )}
                                        </div>
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Bidang
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Dokumen
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredPendaftar.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="px-6 py-4 text-center text-sm text-gray-500">
                                            Tidak ada data yang ditemukan
                                        </td>
                                    </tr>
                                ) : (
                                    filteredPendaftar.map((item, index) => (
                                        <tr key={item.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {index + 1}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {item.nama}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {item.instansi}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {item.no_hp}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <div className="flex flex-col">
                                                    <span>{formatDate(item.start_date)}</span>
                                                    <span>– {formatDate(item.end_date)}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {bidangMap[item.bidang_magang_id] || "-"}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex flex-col space-y-2">
                                                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusVariant[item.status_magang]}`}>
                                                        {item.status_magang}
                                                    </span>
                                                    <select
                                                        className="block w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                                        value={item.status_magang}
                                                        onChange={(e) => updateStatus(item.id, e.target.value)}
                                                    >
                                                        {statusOptions.map((status) => (
                                                            <option key={status} value={status}>
                                                                {status}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <a
                                                    href={`http://localhost:8080/uploads/${item.dokumen}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-blue-600 hover:text-blue-900 flex items-center"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                    Lihat
                                                </a>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Stats Footer */}
                <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between text-sm text-gray-500">
                    <div>Total: {filteredPendaftar.length} pendaftar</div>
                    <div className="flex space-x-4">
                        <div>Aktif: {filteredPendaftar.filter(item => item.status_magang === "Aktif").length}</div>
                        <div>Pending: {filteredPendaftar.filter(item => item.status_magang === "Pending").length}</div>
                        <div>Selesai: {filteredPendaftar.filter(item => item.status_magang === "Selesai").length}</div>
                        <div>Ditolak: {filteredPendaftar.filter(item => item.status_magang === "Ditolak").length}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DataPendaftaran;