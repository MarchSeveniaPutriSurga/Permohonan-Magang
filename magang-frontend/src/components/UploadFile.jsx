import { useState } from "react";
import { Upload } from "lucide-react";

export default function UploadFile({ onFileChange }) {
  const [fileName, setFileName] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      if (onFileChange) {
        onFileChange(file);
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      setFileName(file.name);
      if (onFileChange) {
        onFileChange(file);
      }
    }
  };

  return (
    <div
      className={`w-full relative border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center transition-all ${
        isDragging
          ? "border-blue-500 bg-blue-50"
          : fileName
          ? "border-green-500 bg-green-50"
          : "border-custom-choco-1 hover:border-custom-choco-2 bg-white hover:bg-blue-50"
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div
        className={`p-2 rounded-full mb-2 ${
          fileName
            ? "bg-green-100 text-green-600"
            : "bg-stone-100 text-custom-choco-2"
        }`}
      >
        <Upload size={20} />
      </div>

      <h3 className="font-medium text-gray-800 mb-1 text-sm">
        {fileName ? "File siap diupload" : "Upload file Anda disini"}
      </h3>

      <p className="text-xs text-gray-500 mb-3 text-center">
        {fileName ? fileName : "ZIP, DOCX, PDF (maks. 5MB)"}
      </p>

      <label className="cursor-pointer">
        <div
          className={`px-4 py-1.5 rounded-lg text-white text-sm font-medium transition-all ${
            fileName
              ? "bg-green-500 hover:bg-green-600"
              : "bg-custom-choco-2 hover:bg-custom-choco-3"
          }`}
        >
          {fileName ? "Ganti File" : "Pilih File"}
          <input
            type="file"
            accept=".zip,.docx,.pdf"
            onChange={handleFileChange}
            className="hidden"
            required
          />
        </div>
      </label>
    </div>
  );
}
