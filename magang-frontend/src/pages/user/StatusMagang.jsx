import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import { FaCalendarAlt, FaBriefcase, FaCheckCircle } from "react-icons/fa";
import { getStatusMagangSaya } from "../../utils/api";

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

  const [magangList, setMagangList] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    getStatusMagangSaya(token)
      .then(setMagangList)
      .catch(console.error);
  }, []);


  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="mt-24 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Status Magang
        </h1>

        {magangList.map((magangData) => (
          <div
            key={magangData.id}
            className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden mb-6"
          >
            <div className="bg-gradient-to-r from-custom-choco-2 to-custom-choco-1 px-6 py-5 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">{magangData.nama}</h2>
                </div>
                <span
                  className={`py-1 px-4 rounded-full text-sm font-semibold ${getStatusColor(
                    magangData.status_magang
                  )} text-white flex items-center`}
                >
                  <FaCheckCircle className="mr-1" />
                  {magangData.status_magang}
                </span>
              </div>
            </div>

            <div className="px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <div className="rounded-full bg-blue-100 p-2 mr-3">
                    <FaBriefcase className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Keperluan</p>
                    <p className="font-medium text-gray-800">{magangData.keperluan}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="rounded-full bg-green-100 p-2 mr-3">
                    <FaCalendarAlt className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Tanggal Daftar</p>
                    <p className="font-medium text-gray-800">
                      {new Date(magangData.created_at).toLocaleDateString()}
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
                      {new Date(magangData.start_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex-1 text-center">
                    <p className="text-xs text-gray-500">Selesai</p>
                    <p className="font-medium text-gray-800">
                      {new Date(magangData.end_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

      </div>
    </div>
  );
};

export default StatusMagang;
