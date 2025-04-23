import "../assets/css/App.css";

const BidangCard = ({ bidang, isSelected, onClick, kuota, isFull }) => {
  return (
    <div
      onClick={!isFull ? onClick : null}
      className={`p-5 rounded-xl transition-all duration-300
        ${
          isSelected
            ? "border-2 border-blue-400 bg-gradient-to-br from-blue-50 to-white shadow-md"
            : "border border-gray-200 hover:border-blue-200"
        } 
        ${
          isFull
            ? "bg-gray-50 cursor-not-allowed opacity-80"
            : "cursor-pointer hover:shadow-md"
        }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-bold text-lg text-gray-800 mb-1">
            {bidang.nama}
          </h3>
          {/* <p className="text-sm text-gray-500 line-clamp-2">
            {bidang.deskripsi}
          </p> */}
        </div>
        {isSelected && (
          <div className="bg-blue-100 p-1 rounded-full ml-2">
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

      {kuota ? (
        <div className="mt-4">
          <div className="flex justify-between text-xs font-medium text-gray-500 mb-1">
            <span>Kuota Tersedia</span>
            <span>
              {kuota.current}/{kuota.max}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${
                isFull ? "bg-red-400" : "bg-blue-400"
              }`}
              style={{
                width: `${Math.min(100, (kuota.current / kuota.max) * 100)}%`,
              }}
            ></div>
          </div>
          <div className="mt-2 text-xs font-medium">
            {isFull ? (
              <span className="text-red-500">Kuota telah penuh</span>
            ) : (
              <span className="text-blue-500">
                {kuota.max - kuota.current} slot tersedia
              </span>
            )}
          </div>
        </div>
      ) : (
        <div className="mt-4 flex items-center">
          <div className="animate-pulse flex space-x-2">
            <div className="h-2 bg-gray-200 rounded-full w-3/4"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BidangCard;
