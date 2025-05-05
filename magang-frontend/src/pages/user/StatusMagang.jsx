import React from "react";
import Navbar from "../../components/Navbar";
import {
  FaCalendarAlt,
  FaBriefcase,
  FaBuilding,
  FaClock,
  FaCheckCircle,
  FaFileAlt,
} from "react-icons/fa";

import "../../assets/css/App.css";

const StatusMagang = () => {
  // Data status magang
  const magangData = {
    name: "Sevenia",
    position: "Pengembangan Web",
    registerDate: "2025-04-01",
    startDate: "2025-04-15",
    endDate: "2025-07-15",
    status: "Aktif",
  };

  // Fungsi untuk menentukan warna status
  const getStatusColor = (status) => {
    switch (status) {
      case "Aktif":
        return "bg-green-500";
      case "Selesai":
        return "bg-blue-500";
      case "Menunggu":
        return "bg-yellow-500";
      case "Ditolak":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="mt-24 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Status Magang
        </h1>

        <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Header dengan nama dan status */}
          <div className="bg-gradient-to-r from-custom-choco-2 to-custom-choco-1 px-6 py-5 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">{magangData.name}</h2>
              </div>
              <span
                className={`py-1 px-4 rounded-full text-sm font-semibold ${getStatusColor(
                  magangData.status
                )} text-white flex items-center`}
              >
                <FaCheckCircle className="mr-1" />
                {magangData.status}
              </span>
            </div>
          </div>

          {/* Informasi detail */}
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center">
                <div className="rounded-full bg-blue-100 p-2 mr-3">
                  <FaBriefcase className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Posisi</p>
                  <p className="font-medium text-gray-800">
                    {magangData.position}
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <div className="rounded-full bg-green-100 p-2 mr-3">
                  <FaCalendarAlt className="text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tanggal Pendaftaran</p>
                  <p className="font-medium text-gray-800">
                    {magangData.registerDate}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 border-t border-gray-200 pt-4">
              <p className="text-gray-600 mb-1">Periode Magang:</p>
              <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                <div className="flex-1 text-center">
                  <p className="text-xs text-gray-500">Mulai</p>
                  <p className="font-medium text-gray-800">
                    {magangData.startDate}
                  </p>
                </div>
                <div className="flex-1 text-center">
                  <p className="text-xs text-gray-500">Selesai</p>
                  <p className="font-medium text-gray-800">
                    {magangData.endDate}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer dengan tombol aksi */}
          {/* <div className="px-6 py-4 bg-gray-50">
            <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition flex items-center justify-center">
              <FaFileAlt className="mr-2" />
              Lihat Detail
            </button>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default StatusMagang;
