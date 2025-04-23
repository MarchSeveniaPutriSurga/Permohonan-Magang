const API_URL = "http://localhost:8080/api";

export const getPublishedBidangs = async () => {
  const response = await fetch(`${API_URL}/bidangs`);
  if (!response.ok) {
    throw new Error("Failed to fetch bidang data");
  }
  return await response.json();
};

export const checkKuota = async (startDate, endDate) => {
  try {
    const response = await fetch(
      `${API_URL}/magang/kuota?start_date=${startDate}&end_date=${endDate}`
    );

    if (!response.ok) throw new Error("Gagal memeriksa kuota");

    const usedQuotas = await response.json();

    // Pastikan selalu mengembalikan data kuota lengkap
    const allBidangs = await getPublishedBidangs();
    return allBidangs.reduce((acc, bidang) => {
      acc[bidang.id] = {
        current: usedQuotas[bidang.id]?.count || 0,
        max: parseInt(bidang.kuota),
      };
      return acc;
    }, {});
  } catch (error) {
    console.error("Error checking quota:", error);
    throw error;
  }
};

// export const checkKuota = async (startDate, endDate) => {
//   try {
//     const response = await fetch(
//       `http://localhost:8080/api/magang/kuota?start_date=${startDate}&end_date=${endDate}`
//     );
//     const data = await response.json();
//     return data; // Data ini berisi kuota per bidang
//   } catch (error) {
//     console.error("Error checking quota:", error);
//     throw error;
//   }
// };

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
