import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import {
  FaCalendarAlt,
  FaBriefcase,
  FaCheckCircle,
  FaUser,
  FaClock
} from "react-icons/fa";
import { getStatusMagangSaya, getPublishedBidangs } from "../../utils/api";

import "../../assets/css/App.css";

const StatusMagang = () => {
  const getStatusColor = (status) => {
    switch (status) {
      case "Aktif":
        return "bg-green-500";
      case "Selesai":
        return "bg-blue-500";
      case "Pending":
        return "bg-yellow-500";
      case "Ditolak":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusPriority = (status) => {
    switch (status) {
      case "Aktif":
        return 1;
      case "Pending":
        return 2;
      case "Selesai":
        return 3;
      case "Ditolak":
        return 4;
      default:
        return 5;
    }
  };

  const [magangList, setMagangList] = useState([]);
  const [bidangMagangList, setBidangMagangList] = useState([]);

  const getBidangMagangNama = (bidangId) => {
    const bidang = bidangMagangList.find(b => b.id === bidangId);
    return bidang?.nama || bidang?.nama_bidang || 'Tidak Diketahui';
  };

  const sortedMagangList = [...magangList].sort((a, b) => {
    const priorityDiff = getStatusPriority(a.status_magang) - getStatusPriority(b.status_magang);
    if (priorityDiff !== 0) return priorityDiff;
    return new Date(b.created_at) - new Date(a.created_at);
  });

  const activePendingList = sortedMagangList.filter(m =>
    m.status_magang === 'Aktif' || m.status_magang === 'Pending'
  );
  const completedList = sortedMagangList.filter(m =>
    m.status_magang === 'Selesai' || m.status_magang === 'Ditolak'
  );

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    getStatusMagangSaya(token)
      .then(setMagangList)
      .catch(console.error);

    getPublishedBidangs()
      .then((data) => {
        setBidangMagangList(data.data || data);
      })
      .catch(console.error);
  }, []);

  const MagangItem = ({ magangData, showUserName = true }) => (
    <div className="border-b border-gray-100 pb-4 mb-4 last:border-b-0 last:pb-0 last:mb-0">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center flex-wrap gap-2">
          <span
            className={`py-1.5 px-3 rounded-full text-sm font-semibold ${getStatusColor(
              magangData.status_magang
            )} text-white flex items-center shadow-sm`}
          >
            <FaCheckCircle className="mr-1.5" size={12} />
            {magangData.status_magang}
          </span>
          {showUserName && (
            <span className="bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full font-medium flex items-center">
              <FaUser className="mr-1.5" size={10} />
              {magangData.nama}
            </span>
          )}
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <FaClock className="mr-1" size={12} />
          {new Date(magangData.created_at).toLocaleDateString('id-ID')}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
        <div className="flex items-center">
          <div className="rounded-full bg-blue-100 p-2 mr-3 flex-shrink-0">
            <FaBriefcase className="text-blue-600" size={14} />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-gray-500 mb-0.5">Keperluan</p>
            <p className="font-medium text-gray-800 text-sm">{magangData.keperluan}</p>
          </div>
        </div>

        <div className="flex items-center">
          <div className="rounded-full bg-green-100 p-2 mr-3 flex-shrink-0">
            <FaCalendarAlt className="text-green-600" size={14} />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-gray-500 mb-0.5">Periode Magang</p>
            <p className="font-medium text-gray-800 text-sm">
              {new Date(magangData.start_date).toLocaleDateString('id-ID')} - {new Date(magangData.end_date).toLocaleDateString('id-ID')}
            </p>
          </div>
        </div>
      </div>

      {/* Duration info */}
      <div className="bg-gray-50 rounded-lg p-3">
        <p className="text-xs text-gray-600 mb-1">Durasi & Info</p>
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <span className="text-gray-700">
            <strong>Durasi:</strong> {Math.ceil((new Date(magangData.end_date) - new Date(magangData.start_date)) / (1000 * 60 * 60 * 24))} hari
          </span>
          <span className="text-gray-700">
            <strong>Bidang:</strong> {getBidangMagangNama(magangData.bidang_magang_id)}
          </span>
        </div>
      </div>
    </div>
  );

  const SectionHeader = ({ title, count, color }) => (
    <div className="flex items-center justify-between mb-4 pb-2 border-b-2 border-gray-200">
      <div className="flex items-center">
        <div className={`w-3 h-3 rounded-full mr-3 ${color}`}></div>
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      </div>
      <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
        {count} item{count !== 1 ? 's' : ''}
      </span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="mt-24 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Status Magang
        </h1>

        {magangList.length > 0 ? (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200">
              <div className="bg-gradient-to-r from-custom-choco-2 to-custom-choco-1 px-6 py-4 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="rounded-full bg-white bg-opacity-20 p-2 mr-3">
                      <FaBriefcase className="text-custom-choco-3" size={18} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Semua Status Magang</h2>
                      <p className="text-sm opacity-90">
                        {activePendingList.length} aktif/pending • {completedList.length} selesai/ditolak
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm opacity-90">Total</div>
                    <div className="text-2xl font-bold">{magangList.length}</div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="px-6 py-6">
                {activePendingList.length > 0 && (
                  <div className="mb-8">
                    <SectionHeader
                      title="Status Aktif & Pending"
                      count={activePendingList.length}
                      color="bg-green-500"
                    />
                    {activePendingList.map((magangData) => (
                      <MagangItem
                        key={magangData.id}
                        magangData={magangData}
                      />
                    ))}
                  </div>
                )}

                {completedList.length > 0 && (
                  <div>
                    <SectionHeader
                      title="Status Selesai & Ditolak"
                      count={completedList.length}
                      color="bg-blue-500"
                    />
                    {completedList.map((magangData) => (
                      <MagangItem
                        key={magangData.id}
                        magangData={magangData}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg shadow-md p-8 max-w-md mx-auto">
              <FaBriefcase className="mx-auto text-gray-400 text-4xl mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Belum Ada Data Magang
              </h3>
              <p className="text-gray-600">
                Anda belum memiliki riwayat pendaftaran magang.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatusMagang;