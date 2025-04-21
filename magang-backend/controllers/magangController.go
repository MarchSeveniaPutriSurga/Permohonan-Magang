package controllers

import (
	"fmt"
	"magang-backend/config"
	"net/http"
	"path/filepath"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func CreateMagang(c *gin.Context) {
	id := uuid.New().String()

	nama := c.PostForm("nama")
	keperluan := c.PostForm("keperluan")
	instansi := c.PostForm("instansi")
	no_hp := c.PostForm("no_hp")
	alamat := c.PostForm("alamat")
	start_date := c.PostForm("start_date")
	end_date := c.PostForm("end_date")
	bidang_id := c.PostForm("bidang_magang_id")

	// handle file
	file, err := c.FormFile("dokumen")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "File wajib diunggah"})
		return
	}

	// validasi ekstensi file
	ext := filepath.Ext(file.Filename)
	allowedExt := map[string]bool{".zip": true, ".docx": true, ".pdf": true}
	if !allowedExt[ext] {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format file harus .zip, .docx, atau .pdf"})
		return
	}

	// simpan file
	filename := fmt.Sprintf("%s%s", uuid.New().String(), ext)
	filepath := filepath.Join("uploads", filename)
	if err := c.SaveUploadedFile(file, filepath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal simpan file"})
		return
	}

	// simpan data ke DB
	_, err = config.DB.Exec(`
		INSERT INTO magangs (id, nama, keperluan, instansi, no_hp, alamat, start_date, end_date, dokumen, bidang_magang_id, status_magang, created_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`, id, nama, keperluan, instansi, no_hp, alamat, start_date, end_date, filename, bidang_id, "Pending", time.Now())

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal simpan data magang"})
		return
	}

	// Kurangi kuota bidang magang jika status sudah aktif
	_, err = config.DB.Exec(`
		UPDATE bidang_magangs 
		SET kuota = kuota - 1 
		WHERE id = ? AND kuota > 0
	`, bidang_id)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal update kuota bidang magang"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Pendaftaran berhasil!", "id": id})
}

func GetAllMagangs(c *gin.Context) {
	rows, err := config.DB.Query("SELECT * FROM magangs ORDER BY created_at DESC")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal ambil data"})
		return
	}
	defer rows.Close()

	var magangs []map[string]interface{}
	cols, _ := rows.Columns()

	for rows.Next() {
		columns := make([]interface{}, len(cols))
		columnPointers := make([]interface{}, len(cols))

		for i := range columns {
			columnPointers[i] = &columns[i]
		}

		if err := rows.Scan(columnPointers...); err != nil {
			continue
		}

		magang := make(map[string]interface{})
		for i, colName := range cols {
			val := columnPointers[i].(*interface{})
			switch v := (*val).(type) {
			case []byte:
				magang[colName] = string(v)
			default:
				magang[colName] = v
			}
		}

		magangs = append(magangs, magang)
	}

	c.JSON(http.StatusOK, magangs)
}

func UpdateMagangStatus(c *gin.Context) {
	id := c.Param("id")

	var json struct {
		Status string `json:"status_magang"`
	}

	if err := c.ShouldBindJSON(&json); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format JSON salah"})
		return
	}

	newStatus := json.Status
	allowedStatus := map[string]bool{
		"Aktif": true, "Selesai": true, "Ditolak": true,
	}
	if !allowedStatus[newStatus] {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Status tidak valid"})
		return
	}

	// Ambil status dan bidang_magang_id saat ini
	var oldStatus, bidangID string
	err := config.DB.QueryRow("SELECT status_magang, bidang_magang_id FROM magangs WHERE id = ?", id).Scan(&oldStatus, &bidangID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal ambil data magang"})
		return
	}

	// Update status magang
	_, err = config.DB.Exec("UPDATE magangs SET status_magang = ? WHERE id = ?", newStatus, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal update status"})
		return
	}

	// Atur kuota berdasarkan perubahan status
	if oldStatus != "Aktif" && newStatus == "Aktif" {
		// Kurangi kuota
		_, err = config.DB.Exec("UPDATE bidang_magangs SET kuota = kuota - 1 WHERE id = ? AND kuota > 0", bidangID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengurangi kuota"})
			return
		}
	} else if oldStatus == "Aktif" && (newStatus == "Selesai" || newStatus == "Ditolak") {
		// Tambah kuota
		_, err = config.DB.Exec("UPDATE bidang_magangs SET kuota = kuota + 1 WHERE id = ?", bidangID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menambahkan kuota"})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{"message": "Status berhasil diubah"})
}

// controllers/magang.go
func GetUsedQuota(c *gin.Context) {
	// 1. Ambil parameter
	startDate := c.Query("start_date")
	endDate := c.Query("end_date")

	// 2. Validasi parameter
	if startDate == "" || endDate == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "start_date dan end_date wajib diisi",
		})
		return
	}

	// 3. Validasi format tanggal
	if _, err := time.Parse("2006-01-02", startDate); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "format start_date harus YYYY-MM-DD",
		})
		return
	}

	if _, err := time.Parse("2006-01-02", endDate); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "format end_date harus YYYY-MM-DD",
		})
		return
	}

	// 4. Query ke database
	query := `
        SELECT bidang_magang_id, COUNT(*) as count 
        FROM magangs 
        WHERE status_magang = 'Aktif'
        AND (
            (start_date BETWEEN ? AND ?) OR 
            (end_date BETWEEN ? AND ?) OR 
            (start_date <= ? AND end_date >= ?)
        )
        GROUP BY bidang_magang_id
    `

	rows, err := config.DB.Query(query,
		startDate, endDate,
		startDate, endDate,
		startDate, endDate,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Gagal query database: " + err.Error(),
		})
		return
	}
	defer rows.Close()

	// 5. Proses hasil query
	results := make(map[string]int)
	for rows.Next() {
		var bidangID string
		var count int

		if err := rows.Scan(&bidangID, &count); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Gagal baca hasil query: " + err.Error(),
			})
			return
		}
		results[bidangID] = count
	}

	// 6. Kirim response
	c.JSON(http.StatusOK, results)
}
