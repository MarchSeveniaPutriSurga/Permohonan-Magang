import React, { useState, useMemo, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Users, Eye, X, Clock, MapPin } from 'lucide-react';

// Controller Function to handle the bidangs for specific date.
const useMagangController = () => {
  const [bidangsData, setBidangsData] = useState({});
  const [selectedBidang, setSelectedBidang] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchBidangs = async (date) => {
    const dateKey = date.toISOString().split('T')[0];
    
    // If we already have data for this date, don't fetch again
    if (bidangsData[dateKey]) {
      return bidangsData[dateKey];
    }

    setLoading(true);
    try {
      // Simulate API call - replace with actual API call
      const response = await fetch(`/api/kalender/magang?date=${dateKey}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Add your auth token
        }
      });
      
      let bidangs = [];
      if (response.ok) {
        const data = await response.json();
        bidangs = data.data.filter(bidang => bidang.jumlah_peserta_aktif > 0);
      } else {
        // Fallback with mock data for demonstration
        const mockBidangs = [
          { 
            id: 1, 
            nama: "IT Support", 
            kuota: 5, 
            deskripsi: "Menangani troubleshooting sistem dan maintenance hardware", 
            publish: "1",
            jumlah_peserta_aktif: 3,
            lokasi: "Gedung A Lt. 2"
          },
          { 
            id: 2, 
            nama: "Marketing Digital", 
            kuota: 3, 
            deskripsi: "Mengelola konten media sosial dan campaign digital", 
            publish: "1",
            jumlah_peserta_aktif: 2,
            lokasi: "Gedung B Lt. 1"
          },
          { 
            id: 3, 
            nama: "UI/UX Design", 
            kuota: 4, 
            deskripsi: "Merancang antarmuka dan pengalaman pengguna aplikasi", 
            publish: "1",
            jumlah_peserta_aktif: 1,
            lokasi: "Creative Hub"
          }
        ];
        // Randomly assign bidangs to dates for demonstration
        const randomBidangs = mockBidangs.filter(() => Math.random() > 0.6);
        bidangs = randomBidangs.filter(bidang => bidang.jumlah_peserta_aktif > 0);
      }
      
      // Store the data for this date
      setBidangsData(prev => ({
        ...prev,
        [dateKey]: bidangs
      }));
      
      return bidangs;
    } catch (error) {
      console.error('Error fetching bidangs:', error);
      setBidangsData(prev => ({
        ...prev,
        [dateKey]: []
      }));
      return [];
    } finally {
      setLoading(false);
    }
  };

  const selectBidang = (bidang) => {
    setSelectedBidang(bidang);
  };

  const getBidangsForDate = (date) => {
    const dateKey = date.toISOString().split('T')[0];
    return bidangsData[dateKey] || [];
  };

  return { bidangsData, selectedBidang, fetchBidangs, selectBidang, loading, getBidangsForDate };
};

const KalenderMagang = () => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDateDetail, setSelectedDateDetail] = useState(null);

  const { bidangsData, selectedBidang, fetchBidangs, selectBidang, loading, getBidangsForDate } = useMagangController();

  const monthNames = useMemo(() => [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni", 
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ], []);

  const dayNames = useMemo(() => [
    "Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"
  ], []);

  // Load data for all visible dates when month changes
  useEffect(() => {
    const loadMonthData = async () => {
      const days = generateCalendarDays();
      const promises = days
        .filter(day => day.isCurrentMonth)
        .map(day => fetchBidangs(day.date));
      
      await Promise.all(promises);
    };

    loadMonthData();
  }, [currentDate]);

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const today = new Date();
    
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const isCurrentMonth = date.getMonth() === month;
      const isToday = date.toDateString() === today.toDateString();
      const bidangs = getBidangsForDate(date);
      
      days.push({
        date: new Date(date),
        day: date.getDate(),
        isCurrentMonth,
        isToday,
        bidangs: bidangs
      });
    }
    
    return days;
  };

  const handleDateClick = (date, bidangs) => {
    if (bidangs.length > 0) {
      setSelectedDateDetail({ date, bidangs });
      setShowDetailModal(true);
    }
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => currentYear - i);
  };

  const handleMonthChange = (e) => {
    const newDate = new Date(tempDate);
    newDate.setMonth(e.target.value);
    setTempDate(newDate);
  };

  const handleYearChange = (e) => {
    const newDate = new Date(tempDate);
    newDate.setFullYear(e.target.value);
    setTempDate(newDate);
  };

  const handleDatePickerConfirm = () => {
    setCurrentDate(new Date(tempDate));
    setShowDatePicker(false);
  };

  const showBidangDetail = (bidang) => {
    selectBidang(bidang);
  };

  const calendarDays = generateCalendarDays();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header Section */}
        <div className="mb-8">
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20">
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold">Kalender Magang</h1>
                    <p className="text-blue-100 text-sm">Admin Dashboard - Kelola Jadwal Magang</p>
                  </div>
                </div>
                <button 
                  className="bg-white/20 backdrop-blur text-white px-6 py-3 rounded-xl font-medium hover:bg-white/30 transition-all duration-300 border border-white/30"
                  onClick={() => {
                    setTempDate(new Date(currentDate));
                    setShowDatePicker(true);
                  }}
                >
                  Pilih Periode
                </button>
              </div>
            </div>
            
            {/* Calendar Navigation */}
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <button 
                  className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  onClick={() => navigateMonth(-1)}
                >
                  <ChevronLeft size={20} />
                </button>
                
                <div className="text-center">
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </h2>
                  <p className="text-gray-500 text-sm mt-1">Klik tanggal untuk melihat detail magang</p>
                </div>
                
                <button 
                  className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  onClick={() => navigateMonth(1)}
                >
                  <ChevronRight size={20} />
                </button>
              </div>

              {/* Calendar Grid */}
              <div className="calendar-grid">
                {/* Day headers */}
                <div className="grid grid-cols-7 gap-3 mb-4">
                  {dayNames.map(day => (
                    <div key={day} className="p-4 text-center font-bold bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl shadow-sm">
                      {day}
                    </div>
                  ))}
                </div>
                
                {/* Calendar days */}
                <div className="grid grid-cols-7 gap-3">
                  {calendarDays.map((dayObj, index) => (
                    <div
                      key={index}
                      className={`min-h-32 rounded-xl p-3 transition-all duration-300 flex flex-col ${
                        dayObj.isCurrentMonth 
                          ? dayObj.bidangs.length > 0
                            ? 'bg-white shadow-lg hover:shadow-xl cursor-pointer transform hover:scale-105 border-2 border-transparent hover:border-blue-300'
                            : 'bg-white/60 shadow-sm hover:bg-white/80'
                          : 'bg-gray-100/50 text-gray-400'
                      } ${dayObj.isToday ? 'ring-2 ring-blue-400 bg-gradient-to-br from-blue-50 to-indigo-50' : ''}`}
                      onClick={() => dayObj.isCurrentMonth && dayObj.bidangs.length > 0 && handleDateClick(dayObj.date, dayObj.bidangs)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className={`text-lg font-bold ${
                          dayObj.isToday ? 'text-blue-600' : 
                          dayObj.isCurrentMonth ? 'text-gray-800' : 'text-gray-400'
                        }`}>
                          {dayObj.day}
                        </span>
                        {dayObj.bidangs.length > 0 && (
                          <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                            {dayObj.bidangs.length}
                          </span>
                        )}
                      </div>
                      
                      {dayObj.isCurrentMonth && dayObj.bidangs.length > 0 && (
                        <div className="flex-1 space-y-1">
                          {dayObj.bidangs.slice(0, 2).map((bidang, idx) => (
                            <div
                              key={idx}
                              className="bg-gradient-to-r from-blue-100 to-indigo-100 p-2 rounded-lg border border-blue-200"
                            >
                              <div className="text-xs font-semibold text-blue-800 truncate">
                                {bidang.nama}
                              </div>
                              <div className="flex items-center justify-between mt-1">
                                <div className="flex items-center text-xs text-blue-600">
                                  <Users size={10} className="mr-1" />
                                  <span>{bidang.jumlah_peserta_aktif}/{bidang.kuota}</span>
                                </div>
                                <div className="w-8 bg-blue-200 rounded-full h-1">
                                  <div 
                                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-1 rounded-full transition-all duration-300" 
                                    style={{ 
                                      width: `${Math.min((bidang.jumlah_peserta_aktif / bidang.kuota) * 100, 100)}%` 
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                          {dayObj.bidangs.length > 2 && (
                            <div className="text-xs text-center text-blue-600 font-medium bg-blue-50 rounded-lg py-1">
                              +{dayObj.bidangs.length - 2} lainnya
                            </div>
                          )}
                        </div>
                      )}
                      
                      {dayObj.isCurrentMonth && dayObj.bidangs.length === 0 && (
                        <div className="flex-1 flex items-center justify-center">
                          <span className="text-xs text-gray-400">Tidak ada magang</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Date Picker Modal */}
        {showDatePicker && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full m-4 border border-gray-200">
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-800">Pilih Periode</h3>
                <button 
                  className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  onClick={() => setShowDatePicker(false)}
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Bulan</label>
                    <select 
                      className="w-full p-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      value={tempDate.getMonth()} 
                      onChange={handleMonthChange}
                    >
                      {monthNames.map((month, index) => (
                        <option key={index} value={index}>{month}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Tahun</label>
                    <select 
                      className="w-full p-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      value={tempDate.getFullYear()} 
                      onChange={handleYearChange}
                    >
                      {generateYearOptions().map((year) => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
                <button 
                  className="px-6 py-3 text-gray-600 border-2 border-gray-300 rounded-xl hover:bg-gray-50 font-medium transition-all"
                  onClick={() => setShowDatePicker(false)}
                >
                  Batal
                </button>
                <button 
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 font-medium transition-all shadow-lg"
                  onClick={handleDatePickerConfirm}
                >
                  Pilih
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Detail Modal */}
        {showDetailModal && selectedDateDetail && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden border border-gray-200">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">
                      Detail Magang - {selectedDateDetail.date.toLocaleDateString('id-ID', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </h3>
                    <p className="text-blue-100">
                      {selectedDateDetail.bidangs.length} bidang dengan pendaftar aktif
                    </p>
                  </div>
                  <button 
                    className="text-white/80 hover:text-white p-2 hover:bg-white/20 rounded-lg transition-colors"
                    onClick={() => setShowDetailModal(false)}
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>
              
              <div className="p-6 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {selectedDateDetail.bidangs.map((bidang) => (
                    <div key={bidang.id} className="bg-white border-2 border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                      <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white p-4">
                        <div className="flex justify-between items-start">
                          <h4 className="text-lg font-bold">{bidang.nama}</h4>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            bidang.publish === "1" 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {bidang.publish === "1" ? "Aktif" : "Tidak Aktif"}
                          </span>
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <p className="text-gray-600 text-sm mb-4 leading-relaxed">{bidang.deskripsi}</p>
                        
                        {bidang.lokasi && (
                          <div className="flex items-center text-sm text-gray-500 mb-3">
                            <MapPin size={14} className="mr-2 text-blue-500" />
                            <span>{bidang.lokasi}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center text-sm font-medium">
                            <Users size={16} className="mr-2 text-blue-500" />
                            <span className="text-gray-700">
                              {bidang.jumlah_peserta_aktif || 0} / {bidang.kuota} peserta
                            </span>
                          </div>
                          <button 
                            className="flex items-center px-4 py-2 text-sm bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all shadow-md"
                            onClick={() => showBidangDetail(bidang)}
                          >
                            <Eye size={14} className="mr-2" />
                            Detail
                          </button>
                        </div>
                        
                        {/* Progress bar */}
                        <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full transition-all duration-500" 
                            style={{ 
                              width: `${Math.min(((bidang.jumlah_peserta_aktif || 0) / bidang.kuota) * 100, 100)}%` 
                            }}
                          />
                        </div>
                        <div className="text-xs text-gray-500 text-center">
                          {Math.round(((bidang.jumlah_peserta_aktif || 0) / bidang.kuota) * 100)}% terisi
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Selected Bidang Detail */}
                {selectedBidang && (
                  <div className="mt-8 border-t-2 border-gray-200 pt-8">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl overflow-hidden">
                      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
                        <h4 className="text-xl font-bold">Detail Lengkap: {selectedBidang.nama}</h4>
                      </div>
                      <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div className="bg-white p-4 rounded-xl shadow-sm">
                              <span className="font-semibold text-gray-700 block mb-2">ID Bidang</span>
                              <p className="text-gray-600 text-lg">{selectedBidang.id}</p>
                            </div>
                            
                            <div className="bg-white p-4 rounded-xl shadow-sm">
                              <span className="font-semibold text-gray-700 block mb-2">Nama Bidang</span>
                              <p className="text-gray-600 text-lg">{selectedBidang.nama}</p>
                            </div>
                            
                            <div className="bg-white p-4 rounded-xl shadow-sm">
                              <span className="font-semibold text-gray-700 block mb-2">Status Publish</span>
                              <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                                selectedBidang.publish === "1" 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {selectedBidang.publish === "1" ? "Dipublikasi" : "Tidak Dipublikasi"}
                              </span>
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            <div className="bg-white p-4 rounded-xl shadow-sm">
                              <span className="font-semibold text-gray-700 block mb-2">Kuota Tersedia</span>
                              <span className="px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 rounded-full text-lg font-bold">
                                {selectedBidang.kuota} Orang
                              </span>
                            </div>
                            
                            <div className="bg-white p-4 rounded-xl shadow-sm">
                              <span className="font-semibold text-gray-700 block mb-2">Peserta Aktif</span>
                              <span className="px-4 py-2 bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 rounded-full text-lg font-bold">
                                {selectedBidang.jumlah_peserta_aktif || 0} Orang
                              </span>
                            </div>
                            
                            {selectedBidang.lokasi && (
                              <div className="bg-white p-4 rounded-xl shadow-sm">
                                <span className="font-semibold text-gray-700 block mb-2">Lokasi</span>
                                <p className="text-gray-600 text-lg">{selectedBidang.lokasi}</p>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="mt-6 bg-white p-4 rounded-xl shadow-sm">
                          <span className="font-semibold text-gray-700 block mb-2">Deskripsi</span>
                          <p className="text-gray-600 leading-relaxed">{selectedBidang.deskripsi}</p>
                        </div>
                        
                        <div className="mt-6 flex justify-center">
                          <button 
                            className="px-8 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all font-medium shadow-lg"
                            onClick={() => setSelectedBidang(null)}
                          >
                            Kembali ke Daftar
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end p-6 border-t-2 border-gray-200 bg-gray-50">
                <button 
                  className="px-8 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all font-medium shadow-lg"
                  onClick={() => setShowDetailModal(false)}
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KalenderMagang;