import "../assets/css/App.css";

const BidangCard = ({ bidang, isSelected, onClick, kuota, isFull }) => {
  return (
    <div
      onClick={!isFull ? onClick : null}
      className={`p-5 rounded-xl transition-all duration-300 relative
        ${
          isSelected
            ? "border-2 border-blue-400 bg-gradient-to-br from-blue-50 to-white shadow-md"
            : "border border-gray-200 hover:border-blue-200"
        }
        ${
          isFull
            ? "bg-gray-100 cursor-not-allowed opacity-80"
            : "cursor-pointer hover:shadow-md"
        }
      `}
    >
      <div className="flex items-start justify-between">
        <h3 className="font-bold text-lg text-gray-800">{bidang.nama}</h3>
        {isSelected && (
          <div className="bg-blue-100 p-1 rounded-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-blue-600"
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

      <div className="mt-2 text-sm">
        <div className="text-gray-700">Kuota : {kuota?.max || 0}</div>
        <div className="text-gray-700">
          Jumlah Magang : {kuota?.current || 0}
        </div>
      </div>

      {isFull && (
        <div className="absolute top-2 right-2">
          <span className="bg-red-100 text-red-600 text-xs font-medium px-2 py-1 rounded-full">
            Penuh
          </span>
        </div>
      )}
    </div>
  );
};

export default BidangCard;
