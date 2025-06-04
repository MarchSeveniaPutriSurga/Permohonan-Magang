package controllers

import (
	"magang-backend/config"
	"magang-backend/models"
	"net/http"
	"path/filepath"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

// CreateLogActivity buat log baru
func CreateLogActivity(c *gin.Context) {
	userID := c.MustGet("userID").(uint)

	// Ambil data string dari form
	tanggalStr := c.PostForm("tanggal")
	deskripsi := c.PostForm("deskripsi")

	// Parse string ke time.Time
	tanggal, err := time.Parse("2006-01-02", tanggalStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format tanggal harus YYYY-MM-DD"})
		return
	}

	// Ambil file dari form-data
	file, err := c.FormFile("dokumentasi")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dokumentasi (file) wajib diisi"})
		return
	}

	// Simpan file ke folder uploads/
	filename := filepath.Base(file.Filename)
	savePath := "uploads/" + filename
	if err := c.SaveUploadedFile(file, savePath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan file"})
		return
	}

	// Buat log activity baru
	log := models.LogActivity{
		UserID:      userID,
		Tanggal:     tanggal,
		Deskripsi:   deskripsi,
		Dokumentasi: "/uploads/" + filename,
		Status:      "pending",
	}

	if err := config.DB.Create(&log).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal membuat log activity"})
		return
	}

	c.JSON(http.StatusCreated, log)
}

// GetUserLogActivities ambil semua log activity milik user login
func GetUserLogActivities(c *gin.Context) {
	userID := c.MustGet("userID").(uint)
	var logs []models.LogActivity

	if err := config.DB.Preload("User").Where("user_id = ?", userID).Find(&logs).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data"})
		return
	}

	c.JSON(http.StatusOK, logs)
}

// GetLogActivityByID ambil detail log activity by ID, cek ownership
func GetLogActivityByID(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	userID := c.MustGet("userID").(uint)

	var log models.LogActivity
	if err := config.DB.Preload("User").First(&log, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Log activity tidak ditemukan"})
		return
	}

	if log.UserID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "Tidak punya akses ke log activity ini"})
		return
	}

	c.JSON(http.StatusOK, log)
}

// UpdateLogActivity update log milik user
func UpdateLogActivity(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	userID := c.MustGet("userID").(uint)

	var log models.LogActivity
	if err := config.DB.First(&log, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Log activity tidak ditemukan"})
		return
	}

	if log.UserID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "Tidak punya akses update log activity ini"})
		return
	}

	// Ambil data dari form
	tanggalStr := c.PostForm("tanggal")
	deskripsi := c.PostForm("deskripsi")

	// Parse tanggal ke time.Time
	tanggal, err := time.Parse("2006-01-02", tanggalStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format tanggal harus YYYY-MM-DD"})
		return
	}

	// Cek apakah ada file baru
	file, err := c.FormFile("dokumentasi")
	if err == nil {
		// Ada file baru diupload
		filename := filepath.Base(file.Filename)
		savePath := "uploads/" + filename

		if err := c.SaveUploadedFile(file, savePath); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan file"})
			return
		}

		log.Dokumentasi = "/uploads/" + filename
	}

	// Update field lainnya
	log.Tanggal = tanggal
	log.Deskripsi = deskripsi

	if err := config.DB.Save(&log).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal update log activity"})
		return
	}

	c.JSON(http.StatusOK, log)
}

// DeleteLogActivity hapus log milik user
func DeleteLogActivity(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	userID := c.MustGet("userID").(uint)

	var log models.LogActivity
	if err := config.DB.First(&log, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Log activity tidak ditemukan"})
		return
	}

	if log.UserID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "Tidak punya akses hapus log activity ini"})
		return
	}

	if err := config.DB.Delete(&log).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal hapus log activity"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Log activity berhasil dihapus"})
}

// GetAllLogActivities admin: ambil semua log activity semua user
func GetAllLogActivities(c *gin.Context) {
	var logs []models.LogActivity

	// Preload data user untuk mendapatkan nama user
	if err := config.DB.Preload("User").Find(&logs).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data log activity"})
		return
	}

	c.JSON(http.StatusOK, logs)
}

// ValidateLogActivity admin: setujui / tolak dan isi qr_code_url
func ValidateLogActivity(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))

	// Ambil data dari form
	status := c.PostForm("status")
	qrCodeURL := c.PostForm("qr_code_url")

	if status != "disetujui" && status != "ditolak" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Status harus 'disetujui' atau 'ditolak'"})
		return
	}

	var log models.LogActivity
	if err := config.DB.First(&log, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Log activity tidak ditemukan"})
		return
	}

	log.Status = status
	log.QRCodeURL = qrCodeURL

	if err := config.DB.Save(&log).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal update status log activity"})
		return
	}

	c.JSON(http.StatusOK, log)
}

func UploadSignature(c *gin.Context) {
	// Ambil file
	file, err := c.FormFile("signature")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "File tanda tangan wajib diisi"})
		return
	}

	// Simpan ke folder uploads/
	filename := filepath.Base(file.Filename)
	savePath := "uploads/" + filename
	if err := c.SaveUploadedFile(file, savePath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan file tanda tangan"})
		return
	}

	// Kirim URL-nya ke frontend dalam format JSON
	c.JSON(http.StatusOK, gin.H{
		"url": "/uploads/" + filename,
	})
}
