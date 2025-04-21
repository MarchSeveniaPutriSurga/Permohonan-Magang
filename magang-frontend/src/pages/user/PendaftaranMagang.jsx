import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import PeriodeMagang from "../../components/PeriodeMagang";
import BidangCard from "../../components/BidangCard";
import { getPublishedBidangs, createMagang, checkKuota } from "../../utils/api";

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

  // Handle perubahan periode
  const handlePeriodeChange = async (dates) => {
    setPeriode(dates);
    try {
      const kuotaData = await checkKuota(dates.start_date, dates.end_date);

      // Pastikan semua bidang memiliki data kuota
      const completeKuotaInfo = bidangs.reduce((acc, bidang) => {
        acc[bidang.id] = kuotaData[bidang.id] || {
          current: 0,
          max: parseInt(bidang.kuota),
        };
        return acc;
      }, {});

      setKuotaInfo(completeKuotaInfo);
      setError("");
    } catch (err) {
      setError("Gagal memeriksa kuota: " + err.message);
      setKuotaInfo({});
    }
  };

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

      <div className="container mx-auto p-4 md:p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Pendaftaran Magang
        </h1>

        {/* --- KOMPONEN PERIODE --- */}
        <PeriodeMagang onDateChange={handlePeriodeChange} />

        {/* --- BIDANG MAGANG --- */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Pilih Bidang Magang</h2>

          {!periode.start_date && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
              <p className="text-yellow-700">
                Silakan pilih periode terlebih dahulu
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <h3 className="font-bold text-lg mb-2">Deskripsi Bidang</h3>
              <p>{selectedBidang.deskripsi}</p>
              {kuotaInfo[selectedBidang.id] && (
                <p className="mt-2 font-medium">
                  Kuota: {kuotaInfo[selectedBidang.id].current}/
                  {kuotaInfo[selectedBidang.id].max}
                  {kuotaInfo[selectedBidang.id].current >=
                  kuotaInfo[selectedBidang.id].max ? (
                    <span className="text-red-500 ml-2">(PENUH)</span>
                  ) : (
                    <span className="text-green-500 ml-2">
                      (Tersisa{" "}
                      {kuotaInfo[selectedBidang.id].max -
                        kuotaInfo[selectedBidang.id].current}
                      )
                    </span>
                  )}
                </p>
              )}
            </div>
          )}
        </div>

        {/* --- FORM PENDAFTARAN --- */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Form Pendaftaran</h2>

          <form onSubmit={handleSubmit}>
            {/* NAMA & INSTANSI */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-gray-700 mb-2">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nama"
                  value={formData.nama}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">
                  Instansi <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="instansi"
                  value={formData.instansi}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
            </div>

            {/* NO HP & KEPERLUAN */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-gray-700 mb-2">
                  No. HP <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="no_hp"
                  value={formData.no_hp}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">
                  Keperluan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="keperluan"
                  value={formData.keperluan}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
            </div>

            {/* ALAMAT */}
            <div className="mb-6">
              <label className="block text-gray-700 mb-2">
                Alamat <span className="text-red-500">*</span>
              </label>
              <textarea
                name="alamat"
                value={formData.alamat}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                rows="3"
                required
              ></textarea>
            </div>

            {/* UPLOAD FILE */}
            <div className="mb-6">
              <label className="block text-gray-700 mb-2">
                Upload Dokumen <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                accept=".zip,.docx,.pdf"
                onChange={handleFileChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Format file: .zip, .docx, atau .pdf (maks. 5MB)
                {formData.dokumen && (
                  <span className="text-green-500 ml-2">
                    ✓ File terpilih: {formData.dokumen.name}
                  </span>
                )}
              </p>
            </div>

            {/* PESAN ERROR/SUKSES */}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                {success}
              </div>
            )}

            {/* TOMBOL SUBMIT */}
            <button
              type="submit"
              disabled={!isFormComplete() || loading}
              className={`px-6 py-2 rounded-md text-white ${
                !isFormComplete() || loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-stone-600 hover:bg-stone-700"
              }`}
            >
              {loading ? "Mengirim..." : "Daftar Magang"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PendaftaranMagang;
