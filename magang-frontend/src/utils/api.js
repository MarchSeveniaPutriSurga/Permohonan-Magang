const API_URL = "http://localhost:8080/api";

export const getPublishedBidangs = async () => {
  const response = await fetch(`${API_URL}/bidangs`);
  if (!response.ok) {
    throw new Error("Failed to fetch bidang data");
  }
  return await response.json();
};

export const getMagangPeriode = async (startDate, endDate) => {
  try {
    const response = await fetch(
      `${API_URL}/magang/periode?start_date=${startDate}&end_date=${endDate}`
    );

    if (!response.ok) throw new Error("Gagal memuat data bidang magang");

    return await response.json();
  } catch (error) {
    console.error("Error fetching bidang data by period:", error);
    throw error;
  }
};

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

  const response = await fetch(`${API_URL}/magang`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to submit application");
  }

  return await response.json();
};
