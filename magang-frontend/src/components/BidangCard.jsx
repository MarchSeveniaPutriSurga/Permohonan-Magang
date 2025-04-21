const BidangCard = ({ bidang, isSelected, onClick, kuota, isFull }) => {
  return (
    <div
      onClick={!isFull ? onClick : null}
      className={`p-4 rounded-lg transition-all 
        ${
          isSelected
            ? "border-2 border-blue-500 bg-blue-50"
            : "border border-gray-200"
        } 
        ${
          isFull
            ? "bg-gray-100 cursor-not-allowed"
            : "cursor-pointer hover:bg-blue-50"
        }`}
    >
      <h3 className="font-bold text-lg">{bidang.nama}</h3>

      {kuota ? (
        <div className="mt-2 text-sm">
          Kuota: {kuota.current}/{kuota.max}
          {isFull ? (
            <span className="ml-2 text-red-500 font-medium">(PENUH)</span>
          ) : (
            <span className="ml-2 text-green-500">
              ({kuota.max - kuota.current} tersedia)
            </span>
          )}
        </div>
      ) : (
        <div className="mt-2 text-sm text-gray-500">Memuat kuota...</div>
      )}
    </div>
  );
};

export default BidangCard;
