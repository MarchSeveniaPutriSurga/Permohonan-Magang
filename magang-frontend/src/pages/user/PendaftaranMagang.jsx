import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import Navbar from "../../components/Navbar";
import PeriodeMagang from "../../components/PeriodeMagang";
import BidangCard from "../../components/BidangCard";
import UploadFile from "../../components/UploadFile";

import {
  getPublishedBidangs,
  createMagang,
  getMagangPeriode,
} from "../../utils/api";
import "../../assets/css/App.css";

const PendaftaranMagang = () => {
  const [bidangs, setBidangs] = useState([]);
  const [selectedBidang, setSelectedBidang] = useState(null);
  const [selectedBidangDescription, setSelectedBidangDescription] =
    useState(null);
  const [periode, setPeriode] = useState({ start_date: "", end_date: "" });
  const [kuotaInfo, setKuotaInfo] = useState({});
  const [formData, setFormData] = useState({
    nama: "",
    keperluan: "",
    instansi: "",
    no_hp: "",
    alamat: "",
    dokumen: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // cek apakah form sudah lengkap
  const isFormComplete = () => {
    return (
      periode.start_date &&
      periode.end_date &&
      selectedBidang &&
      !isBidangFull(selectedBidang.id) &&
      formData.nama &&
      formData.instansi &&
      formData.no_hp &&
      formData.keperluan &&
      formData.alamat &&
      formData.dokumen
    );
  };

  // Cek kuota per bidang
  const isBidangFull = (bidangId) => {
    const kuota = kuotaInfo[bidangId];
    return kuota && kuota.current >= kuota.max;
  };

  // Ambil data bidang dari API
  useEffect(() => {
    const fetchBidangs = async () => {
      try {
        const data = await getPublishedBidangs();
        setBidangs(data);
      } catch (err) {
        setError("Gagal memuat data bidang");
      }
    };
    fetchBidangs();
  }, []);

  useEffect(() => {
    console.log("kuotaInfo:", kuotaInfo);
  }, [kuotaInfo]);

  // memperbarui kuota setelah perubahan status magang
  const updateKuotaAfterStatusChange = async (bidangId) => {
    try {
      const kuotaData = await getMagangPeriode(
        periode.start_date,
        periode.end_date
      );
      setKuotaInfo((prevKuota) => ({
        ...prevKuota,
        [bidangId]: kuotaData[bidangId] || { current: 0, max: 0 },
      }));
    } catch (error) {
      console.error("Gagal memuat kuota terbaru", error);
    }
  };

  // Handle perubahan periode
  const handlePeriodeChange = async (dates) => {
    setPeriode(dates);

    if (!dates.start_date || !dates.end_date) return;

    try {
      setLoading(true);

      const result = await getMagangPeriode(dates.start_date, dates.end_date);

      console.log("Hasil result dari API:", result);

      if (result.status === "200" && result.data) {
        const completeKuotaInfo = result.data.reduce((acc, bidang) => {
          acc[bidang.id] = {
            current: bidang.jumlah_magang || 0,
            max: parseInt(bidang.kuota) || 0,
          };
          return acc;
        }, {});
        setKuotaInfo(completeKuotaInfo);
      }
    } catch (err) {
      console.error("Error:", err);
      setError("Gagal memeriksa kuota bidang magang");
    } finally {
      setLoading(false);
    }
  };

  // Handle pilih bidang
  const handleBidangSelect = (bidang) => {
    if (isBidangFull(bidang.id)) return;
    setSelectedBidang(bidang);
  };

  const handleBidangDescriptionSelect = (bidang) => {
    setSelectedBidangDescription(bidang);
  };

  // Handle input text/textarea
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle upload file
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validasi tipe file
    const validTypes = [
      "application/zip",
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!validTypes.includes(file.type)) {
      setError("Format file harus .zip, .docx, atau .pdf");
      return;
    }

    // Validasi ukuran file (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError("Ukuran file maksimal 5MB");
      return;
    }

    setFormData((prev) => ({ ...prev, dokumen: file }));
    setError("");
  };

  // Validasi sebelum submit
  const validateForm = () => {
    if (!periode.start_date || !periode.end_date) {
      setError("Harap pilih periode magang");
      return false;
    }

    if (!selectedBidang) {
      setError("Harap pilih bidang magang");
      return false;
    }

    if (isBidangFull(selectedBidang.id)) {
      setError("Kuota bidang ini sudah penuh");
      return false;
    }

    // Cek field kosong
    const requiredFields = ["nama", "instansi", "no_hp", "keperluan", "alamat"];
    for (const field of requiredFields) {
      if (!formData[field]) {
        setError(`Harap isi ${field.replace("_", " ")}`);
        return false;
      }
    }

    if (!formData.dokumen) {
      setError("Harap upload dokumen pendukung");
      return false;
    }

    return true;
  };

  // Handle submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await createMagang({
        ...formData,
        ...periode,
        bidang_magang_id: selectedBidang.id,
      });

      Swal.fire({
        icon: "success",
        title: "Pendaftaran Berhasil",
        text: "Data magang kamu sudah dikirim!",
        confirmButtonColor: "#3b82f6",
      });

      // Reset form
      setFormData({
        nama: "",
        keperluan: "",
        instansi: "",
        no_hp: "",
        alamat: "",
        dokumen: null,
      });
      setSelectedBidang(null);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Pendaftaran Gagal",
        text: err.message || "Terjadi kesalahan saat mengirim data.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="mt-24 container mx-auto p-4 md:p-8 max-w-6xl">
        {/* Header sederhana */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Magang Diskominfo - DIY
          </h1>
        </div>

        {/* --- DESKRIPSI BIDANG SECTION --- */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-soft-choco-1 rounded-full flex items-center justify-center mr-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-custom-choco-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-800">
              Deskripsi Bidang Magang
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {bidangs.map((bidang) => (
              <div
                key={bidang.id}
                className={`cursor-pointer p-5 relative rounded-xl transition-all duration-300 border ${selectedBidangDescription?.id === bidang.id
                    ? "border-blue-400 bg-white shadow-md"
                    : "border-gray-200 hover:border-blue-200"
                  }`}
                onClick={() => handleBidangDescriptionSelect(bidang)}
              >
                <h3 className="font-bold text-lg text-gray-800 mb-1">
                  {bidang.nama}
                </h3>

                {selectedBidangDescription?.id === bidang.id && (
                  <div className="absolute top-2 right-2 bg-slate-100 rounded-full p-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-olive-1"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>

          {selectedBidangDescription && (
            <div className="bg-custom-green-1 p-4 rounded-lg mb-4 border-2 border-stone-200">
              <h3 className="font-bold text-gray-700 mb-2">Deskripsi Bidang</h3>
              <p className="text-gray-600">
                {selectedBidangDescription.deskripsi}
              </p>
            </div>
          )}
        </div>

        {/* --- PERIODE SECTION --- */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-soft-choco-1 rounded-full flex items-center justify-center mr-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-custom-choco-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-800">
              Periode Magang
            </h2>
          </div>

          <PeriodeMagang onDateChange={handlePeriodeChange} />
        </div>

        {/* --- FORMULIR PENDAFTARAN --- */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-soft-choco-1 rounded-full flex items-center justify-center mr-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-custom-choco-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-800">
              Formulir Pendaftaran
            </h2>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* --- KUOTA BIDANG SECTION --- */}
              <div className="border-b border-gray-200 pb-6">
                <div className="flex items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Pilih Bidang Magang
                  </h3>
                </div>

                {!periode.start_date || !periode.end_date ? (
                  <div className="bg-yellow-50 border-l-4 border-yellow-300 p-4 mb-6 rounded">
                    <div className="flex items-start">
                      <svg
                        className="h-5 w-5 text-yellow-400 mr-2 mt-0.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <p className="text-yellow-700">
                        Silakan pilih periode terlebih dahulu
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {bidangs.map((bidang) => {
                      const bidangKuota = kuotaInfo[bidang.id] || {
                        current: 0,
                        max: bidang.kuota,
                      };
                      const isBidangFull =
                        bidangKuota.current >= bidangKuota.max;

                      return (
                        <BidangCard
                          key={bidang.id}
                          bidang={bidang}
                          isSelected={selectedBidang?.id === bidang.id}
                          onClick={() => handleBidangSelect(bidang)}
                          kuota={bidangKuota}
                          isFull={isBidangFull}
                        />
                      );
                    })}
                  </div>
                )}
              </div>

              {/* FORMULIR PENDAFTARAN */}
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-4">
                  Data Diri
                </h3>
                <div className="space-y-5">
                  {/* NAMA & INSTANSI */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Nama Lengkap <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        name="nama"
                        value={formData.nama}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-300 focus:border-blue-300 transition"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Instansi <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        name="instansi"
                        value={formData.instansi}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-300 focus:border-blue-300 transition"
                        required
                      />
                    </div>
                  </div>

                  {/* NO HP & KEPERLUAN */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        No. HP <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="tel"
                        name="no_hp"
                        value={formData.no_hp}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-300 focus:border-blue-300 transition"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Keperluan <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        name="keperluan"
                        value={formData.keperluan}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-300 focus:border-blue-300 transition"
                        required
                      />
                    </div>
                  </div>

                  {/* ALAMAT */}
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Alamat <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      name="alamat"
                      value={formData.alamat}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-300 focus:border-blue-300 transition"
                      rows="3"
                      required
                    ></textarea>
                  </div>

                  {/* UPLOAD FILE */}
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Upload Dokumen <span className="text-red-400">*</span>
                    </label>
                    <div className="mt-1 flex items-center">
                      <UploadFile
                        onFileChange={(file) =>
                          setFormData((prev) => ({
                            ...prev,
                            dokumen: file,
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* PESAN ERROR/SUKSES */}
              {error && (
                <div className="bg-red-50 border-l-4 border-red-300 p-3 rounded">
                  <div className="flex items-center">
                    <svg
                      className="h-4 w-4 text-red-400 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                </div>
              )}

              {success && (
                <div className="bg-green-50 border-l-4 border-green-300 p-3 rounded">
                  <div className="flex items-center">
                    <svg
                      className="h-4 w-4 text-green-400 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <p className="text-green-600 text-sm">{success}</p>
                  </div>
                </div>
              )}

              {/* TOMBOL SUBMIT */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={!isFormComplete() || loading}
                  className={`w-full px-5 py-2.5 rounded-lg font-medium text-white transition 
                    ${!isFormComplete() || loading
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-blue-500 hover:bg-blue-600"
                    }`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Mengirim...
                    </div>
                  ) : (
                    "Daftar Magang"
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PendaftaranMagang;
