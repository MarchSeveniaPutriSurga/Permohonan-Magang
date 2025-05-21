const API_URL = "http://localhost:8080/api";
const USER_URL = "http://localhost:8080/user";

// ambil semua bidang magang (protected, butuh token)
export const getPublishedBidangs = async () => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/bidangs`, {
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
  const response = await fetch(`${API_URL}/dashboard/stats`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Gagal ambil statistik dashboard");
  return await response.json();
};

export const getPendaftaranChart = async () => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}/pendaftaran/chart`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Gagal ambil data chart pendaftaran");
  return await response.json();
};

export const getDistribusiBidangMagang = async () => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}/bidang/distribusi`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Gagal ambil distribusi bidang magang");
  return await response.json();
};