const API_URL = "http://localhost:8080/api";
const USER_URL = "http://localhost:8080/user";
const ADMIN_URL = "http://localhost:8080/admin";

// ambil semua bidang magang (protected, butuh token)
// export const getPublishedBidangs = async () => {
//   const token = localStorage.getItem("token");

//   const response = await fetch(`${API_URL}/bidangs`, {
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//   });

//   if (!response.ok) {
//     throw new Error("Failed to fetch bidang data");
//   }

//   return await response.json();
// };
export const getPublishedBidangs = async () => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/bidangs/published`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch bidang data");
  }

  return await response.json();
};


// ambil kuota bidang untuk periode tertentu (protected)
export const getMagangPeriode = async (startDate, endDate) => {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_URL}/magang/periode?start_date=${startDate}&end_date=${endDate}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) throw new Error("Gagal memuat data bidang magang");

  return await response.json();
};

// kirim pendaftaran magang (protected)
export const createMagang = async (data) => {
  const formData = new FormData();
  Object.keys(data).forEach((key) => {
    if (key !== "dokumen") {
      formData.append(key, data[key]);
    }
  });

  if (data.dokumen) {
    formData.append("dokumen", data.dokumen);
  }

  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/magang`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to submit application");
  }

  return await response.json();
};

// ambil status magang user yang sedang login (protected)
export const getStatusMagangSaya = async () => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${USER_URL}/magang/status-saya`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Gagal mengambil status magang");
  }

  const result = await response.json();
  return result.data;
};

export const getUserProfile = async () => {
  const token = localStorage.getItem("token");
  const response = await fetch("http://localhost:8080/user/profile", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error("Gagal mengambil profil user");
  }
  const result = await response.json();
  return result.user;
};

//admin area
export const getDashboardStats = async () => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${ADMIN_URL}/dashboard/stats`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Gagal ambil statistik dashboard");
  return await response.json();
};

export const getPendaftaranChart = async () => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${ADMIN_URL}/pendaftaran/chart`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Gagal ambil data chart pendaftaran");
  return await response.json();
};

export const getDistribusiBidangMagang = async () => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${ADMIN_URL}/bidang/distribusi`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Gagal ambil distribusi bidang magang");
  return await response.json();
};

export const createLogActivity = async (data) => {
  const formData = new FormData();
  formData.append("tanggal", data.tanggal);
  formData.append("deskripsi", data.deskripsi);
  if (data.dokumentasi) {
    formData.append("dokumentasi", data.dokumentasi);
  }

  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}/log-activities`, {
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

export const getUserLogActivities = async () => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}/log-activities`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch log activities");
  }

  return await response.json();
};

export const getLogActivityByID = async (id) => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}/log-activities/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch log activity detail");
  }

  return await response.json();
};

export const updateLogActivity = async (id, data) => {
  const formData = new FormData();
  formData.append("tanggal", data.tanggal);
  formData.append("deskripsi", data.deskripsi);
  if (data.dokumentasi) {
    formData.append("dokumentasi", data.dokumentasi);
  }

  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}/log-activities/${id}`, {
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

export const deleteLogActivity = async (id) => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}/log-activities/${id}`, {
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


//admin
export const getAllLogActivities = async () => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${ADMIN_URL}/log-activities`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch all log activities");
  }

  return await response.json();
};

export const validateLogActivity = async (id, status, qrCodeUrl = "") => {
  const formData = new FormData();
  formData.append("status", status);
  if (qrCodeUrl) {
    formData.append("qr_code_url", qrCodeUrl);
  }

  const token = localStorage.getItem("token");
  const response = await fetch(`${ADMIN_URL}/log-activities/${id}/validate`, {
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

// Helper function untuk generate QR Code URL
export const generateQRCodeUrl = (mentorSignatureUrl = "https://example.com/mentor-signature.png") => {
  // Generate QR code yang berisi URL tanda tangan mentor
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(mentorSignatureUrl)}`;
};

export const uploadMentorSignature = async (file) => {
  const formData = new FormData();
  formData.append("signature", file);

  const token = localStorage.getItem("token");
  const response = await fetch(`${ADMIN_URL}/upload-signature`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Gagal upload tanda tangan");
  }

  return await response.json();
};
