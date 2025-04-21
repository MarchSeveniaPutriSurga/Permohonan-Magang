import { useState } from "react";

const PeriodeMagang = ({ onDateChange }) => {
  const [dates, setDates] = useState({
    start_date: "",
    end_date: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newDates = { ...dates, [name]: value };

    // Validasi tanggal
    if (
      newDates.start_date &&
      newDates.end_date &&
      new Date(newDates.end_date) < new Date(newDates.start_date)
    ) {
      alert("Tanggal selesai harus setelah tanggal mulai");
      return;
    }

    setDates(newDates);

    // Kirim data ke parent component
    if (newDates.start_date && newDates.end_date) {
      onDateChange(newDates);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">
        Pilih Periode Magang <span className="text-red-500">*</span>
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Tanggal Mulai
          </label>
          <input
            type="date"
            name="start_date"
            value={dates.start_date}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Tanggal Selesai
          </label>
          <input
            type="date"
            name="end_date"
            value={dates.end_date}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>
      </div>
    </div>
  );
};

export default PeriodeMagang;
