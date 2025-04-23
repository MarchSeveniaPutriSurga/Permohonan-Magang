import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import PeriodeMagang from "../../components/PeriodeMagang";
import BidangCard from "../../components/BidangCard";
import { getPublishedBidangs, createMagang, checkKuota } from "../../utils/api";
import "../../assets/css/App.css";

const PendaftaranMagang = () => {
  const [bidangs, setBidangs] = useState([]);
  const [selectedBidang, setSelectedBidang] = useState(null);
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

  // Fungsi untuk cek apakah form sudah lengkap
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
    return kuotaInfo[bidangId]?.current >= kuotaInfo[bidangId]?.max;
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

  // Fungsi untuk memperbarui kuota setelah perubahan status magang
  const updateKuotaAfterStatusChange = async (bidangId) => {
    try {
      // Panggil API untuk mendapatkan kuota yang terbaru
      const kuotaData = await checkKuota(periode.start_date, periode.end_date);

      // Perbarui state kuota dengan data terbaru
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
    try {
      const kuotaData = await checkKuota(dates.start_date, dates.end_date);

      // Pastikan semua bidang memiliki data kuota
      const completeKuotaInfo = bidangs.reduce((acc, bidang) => {
        // Jika end_date sudah lewat, tambahkan kuota untuk bidang yang kosong
        if (new Date(dates.end_date) > new Date()) {
          acc[bidang.id] = kuotaData[bidang.id] || {
            current: 0,
            max: parseInt(bidang.kuota),
          };
        } else {
          acc[bidang.id] = kuotaData[bidang.id] || {
            current: 0,
            max: parseInt(bidang.kuota) + 1, // Tambahkan kuota jika sudah lewat
          };
        }
        return acc;
      }, {});

      setKuotaInfo(completeKuotaInfo);
      setError("");
    } catch (err) {
      setError("Gagal memeriksa kuota: " + err.message);
      setKuotaInfo({});
    }
  };

  // const handlePeriodeChange = async (dates) => {
  //   setPeriode(dates);

  //   try {
  //     const kuotaData = await checkKuota(dates.start_date, dates.end_date);

  //     // Pastikan semua bidang memiliki data kuota
  //     const completeKuotaInfo = bidangs.reduce((acc, bidang) => {
  //       // Jika end_date sudah lewat, tambahkan kuota untuk bidang yang kosong
  //       if (new Date(dates.end_date) > new Date()) {
  //         acc[bidang.id] = kuotaData[bidang.id] || {
  //           current: 0,
  //           max: parseInt(bidang.kuota),
  //         };
  //       } else {
  //         acc[bidang.id] = kuotaData[bidang.id] || {
  //           current: 0,
  //           max: parseInt(bidang.kuota) + 1, // Tambahkan kuota jika sudah lewat
  //         };
  //       }
  //       return acc;
  //     }, {});

  //     setKuotaInfo(completeKuotaInfo);
  //     setError("");
  //   } catch (err) {
  //     setError("Gagal memeriksa kuota: " + err.message);
  //     setKuotaInfo({});
  //   }
  // };

  // Handle pilih bidang
  const handleBidangSelect = (bidang) => {
    if (isBidangFull(bidang.id)) return;
    setSelectedBidang(bidang);
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

      setSuccess("Pendaftaran berhasil!");

      // Perbarui kuota setelah status magang diubah
      updateKuotaAfterStatusChange(selectedBidang.id);

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
      setError(err.message || "Gagal mendaftar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto p-4 md:p-8 max-w-6xl">
        {/* Header sederhana */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Pendaftaran Magang
          </h1>
          <p className="text-gray-600 mt-2">
            Silakan lengkapi form pendaftaran magang berikut
          </p>
        </div>

        {/* --- PERIODE SECTION --- */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center mr-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-blue-400"
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

        {/* --- BIDANG SECTION --- */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center mr-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-blue-400"
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
              Pilih Bidang Magang
            </h2>
          </div>

          {!periode.start_date && (
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
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {bidangs.map((bidang) => (
              <BidangCard
                key={bidang.id}
                bidang={bidang}
                isSelected={selectedBidang?.id === bidang.id}
                onClick={() => handleBidangSelect(bidang)}
                kuota={kuotaInfo[bidang.id]}
                isFull={isBidangFull(bidang.id)}
              />
            ))}
          </div>

          {selectedBidang && (
            <div className="bg-blue-50 p-4 rounded-lg mb-4 border border-blue-100">
              <h3 className="font-bold text-gray-700 mb-2">Deskripsi Bidang</h3>
              <p className="text-gray-600">{selectedBidang.deskripsi}</p>
              {kuotaInfo[selectedBidang.id] && (
                <div className="mt-3">
                  <span className="text-sm font-medium text-gray-600">
                    Kuota: {kuotaInfo[selectedBidang.id].current}/
                    {kuotaInfo[selectedBidang.id].max}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* --- FORM SECTION --- */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center mr-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-blue-400"
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
                  <label className="cursor-pointer">
                    <div className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-600 hover:bg-gray-50 transition text-sm">
                      <span>Pilih File</span>
                      <input
                        type="file"
                        accept=".zip,.docx,.pdf"
                        onChange={handleFileChange}
                        className="hidden"
                        required
                      />
                    </div>
                  </label>
                  {formData.dokumen && (
                    <span className="ml-3 text-sm text-gray-500">
                      {formData.dokumen.name}
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, dokumen: null }))
                        }
                        className="ml-2 text-gray-400 hover:text-gray-600"
                      >
                        ×
                      </button>
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-gray-400">
                  Format file: .zip, .docx, atau .pdf (maks. 5MB)
                </p>
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
                    ${
                      !isFormComplete() || loading
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
