package controllers

import (
	"fmt"
	"log"
	"magang-backend/config"
	"magang-backend/models"
	"net/http"
	"path/filepath"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// CreateMagang
func CreateMagang(c *gin.Context) {
	id := uuid.New().String()

	// Ambil data form
	nama := c.PostForm("nama")
	keperluan := c.PostForm("keperluan")
	instansi := c.PostForm("instansi")
	no_hp := c.PostForm("no_hp")
	alamat := c.PostForm("alamat")
	start_date := c.PostForm("start_date")
	end_date := c.PostForm("end_date")
	bidang_id := c.PostForm("bidang_magang_id")

	// Handle file upload
	file, err := c.FormFile("dokumen")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "File wajib diunggah"})
		return
	}

	// Validasi ekstensi file
	ext := filepath.Ext(file.Filename)
	allowedExt := map[string]bool{".zip": true, ".docx": true, ".pdf": true}
	if !allowedExt[ext] {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format file harus .zip, .docx, atau .pdf"})
		return
	}

	// Simpan file
	filename := fmt.Sprintf("%s%s", uuid.New().String(), ext)
	filePath := filepath.Join("uploads", filename)
	if err := c.SaveUploadedFile(file, filePath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal simpan file"})
		return
	}

	// Simpan data pendaftaran dengan status "Pending"
	result := config.DB.Exec(
		"INSERT INTO magangs (id, nama, keperluan, instansi, no_hp, alamat, start_date, end_date, dokumen, bidang_magang_id, status_magang, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
		id, nama, keperluan, instansi, no_hp, alamat, start_date, end_date, filename, bidang_id, "Pending", time.Now())

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal simpan data magang"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Pendaftaran berhasil!", "id": id})
}

// mendapatkan semua data magang
func GetAllMagangs(c *gin.Context) {
	var magangs []models.Magang
	result := config.DB.Find(&magangs)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}

	c.JSON(http.StatusOK, magangs)
}

// memperbarui status magang
func UpdateMagangStatus(c *gin.Context) {
	id := c.Param("id")

	var json struct {
		Status string `json:"status_magang"`
	}

	if err := c.ShouldBindJSON(&json); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format JSON salah"})
		return
	}

	// ambil status magang saat ini dari database
	var magang models.Magang
	result := config.DB.First(&magang, "id = ?", id)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Magang tidak ditemukan"})
		return
	}

	// update status magang
	result = config.DB.Exec("UPDATE magangs SET status_magang = ? WHERE id = ?", json.Status, id)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Status magang updated successfully"})
}

// menghitung jumlah magang aktif dalam periode yang dipilih
func GetUsedQuota(c *gin.Context) {
	startDate := c.Query("start_date")
	endDate := c.Query("end_date")

	startTime, err := time.Parse("2006-01-02", startDate)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid start_date format"})
		return
	}

	endTime, err := time.Parse("2006-01-02", endDate)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid end_date format"})
		return
	}

	// menghitung kuota yang digunakan berdasarkan status aktif dan periode tumpang tindih
	query := `
        SELECT bidang_magang_id, COUNT(*) as count 
        FROM magangs 
        WHERE status_magang = 'Aktif'
        AND (
            -- Periode magang sudah dimulai sebelum atau saat tanggal mulai pencarian
            (start_date <= ? AND end_date >= ?)
            OR (start_date <= ? AND end_date >= ?)
            OR (start_date >= ? AND end_date <= ?)
        )
        GROUP BY bidang_magang_id
    `

	var results []struct {
		BidangID string `json:"bidang_magang_id"`
		Count    int    `json:"count"`
	}

	err = config.DB.Raw(query, endTime, startTime, startTime, endTime, startTime, endTime).Scan(&results).Error
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal query database"})
		return
	}

	// Membuat map untuk hasil
	resultMap := make(map[string]int)
	for _, r := range results {
		resultMap[r.BidangID] = r.Count
	}

	// Ambil semua bidang magang untuk mendapatkan informasi kuota (kuota tetap statis)
	var bidangs []models.BidangMagang
	if err := config.DB.Find(&bidangs).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data bidang"})
		return
	}

	// Membuat response yang mencakup kuota tersedia dan kuota terpakai
	response := make(map[string]map[string]interface{})
	for _, bidang := range bidangs {
		used := resultMap[bidang.ID]
		response[bidang.ID] = map[string]interface{}{
			"count": used,
			"max":   bidang.Kuota,
		}
	}

	c.JSON(http.StatusOK, response)
}

func MagangPeriode(c *gin.Context) {
	var (
		result          gin.H
		bidangWithCount []models.BidangMagangWithCount
	)

	// Mengambil nilai start_date dan end_date dari query params
	startDateStr := c.Query("start_date")
	endDateStr := c.Query("end_date")

	log.Println("Request Parameters - start_date:", startDateStr, "end_date:", endDateStr)

	// validasi bahwa start_date dan end_date ada
	if startDateStr == "" || endDateStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "400",
			"message": "Parameter start_date dan end_date diperlukan",
		})
		return
	}

	// Debug: Query database secara langsung untuk verifikasi
	var debugCount int64
	debugQuery := `
		SELECT COUNT(*) 
		FROM magangs 
		WHERE status_magang = 'Aktif' 
		AND start_date >= ? 
		AND end_date <= ? 
		AND bidang_magang_id = '1ae5a49d-0e63-45f0-b103-c856661b97d0'
	`
	config.DB.Raw(debugQuery, startDateStr, endDateStr).Count(&debugCount)
	log.Println("Debug direct query count:", debugCount)

	// verifikasi format tanggal yang tersimpan di database
	var dateCheck struct {
		ID        string    `json:"id"`
		StartDate time.Time `json:"start_date"`
		EndDate   time.Time `json:"end_date"`
		Status    string    `json:"status_magang"`
	}
	config.DB.Raw("SELECT id, start_date, end_date, status_magang FROM magangs WHERE bidang_magang_id = '1ae5a49d-0e63-45f0-b103-c856661b97d0' LIMIT 1").Scan(&dateCheck)
	log.Println("Sample date from DB:", dateCheck)

	query := `
    SELECT 
        b.id, 
        b.nama AS nama_bidang, 
        b.kuota, 
        COALESCE(m.count, 0) AS jumlah_magang
    FROM 
        bidang_magangs b
    LEFT JOIN (
        SELECT 
            bidang_magang_id, 
            COUNT(*) AS count
        FROM 
            magangs
        WHERE 
            status_magang = 'Aktif' 
            AND (
                -- Periode magang sudah dimulai sebelum atau saat tanggal mulai pencarian
                (start_date <= ? AND end_date >= ?)
                OR (start_date <= ? AND end_date >= ?)
                OR (start_date >= ? AND end_date <= ?)
            )
        GROUP BY 
            bidang_magang_id
    ) m ON b.id = m.bidang_magang_id
`

	// Perhatikan parameter yang bertambah jumlahnya
	err := config.DB.Raw(query, endDateStr, startDateStr, startDateStr, endDateStr, startDateStr, endDateStr).Scan(&bidangWithCount).Error

	// cek jika ada error pada query
	if err != nil {
		log.Println("Error DB:", err.Error())
		result = gin.H{
			"status":  "400",
			"message": "Gagal mengambil data magang",
			"data":    "",
		}
		c.JSON(http.StatusInternalServerError, result)
		return
	}

	log.Println("Data Bidang Magang:", bidangWithCount)

	// mengembalikan data
	result = gin.H{
		"status":  "200",
		"message": "Data magang per bidang berhasil diambil",
		"data":    bidangWithCount,
	}
	c.JSON(http.StatusOK, result)
}
