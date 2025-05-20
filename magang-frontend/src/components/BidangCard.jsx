import "../assets/css/App.css";

const BidangCard = ({ bidang, isSelected, onClick, kuota, isFull }) => {
  return (
    <div
      onClick={!isFull ? onClick : null}
      className={`p-5 rounded-xl transition-all duration-300 relative border-2
        ${isSelected
          ? "border-green-600 bg-gradient-to-br from-green-50 to-white"
          : "border-gray-300 hover:border-green-400"
        }
        ${isFull
          ? "bg-gray-100 cursor-not-allowed opacity-70"
          : "cursor-pointer hover:shadow-sm"
        }
      `}
    >
      <div className="absolute top-2 right-2 flex items-center space-x-1">
        {isSelected && (
          <div className="bg-white p-[2px] rounded-full shadow-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-green-600"
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
        {isFull && (
          <span className="bg-red-100 text-red-700 text-xs font-semibold px-2 py-1 rounded-full">
            Penuh
          </span>
        )}
      </div>

      <h3 className="font-semibold text-lg text-[#4B2E2E]">{bidang.nama}</h3>

      <div className="mt-2 text-sm space-y-1">
        <div className="text-[#5C4033]">Kuota: {kuota?.max || 0}</div>
        <div className="text-[#5C4033]">
          Jumlah Magang Aktif: {kuota?.current || 0}
        </div>
      </div>
    </div>
  );
};

export default BidangCard;
