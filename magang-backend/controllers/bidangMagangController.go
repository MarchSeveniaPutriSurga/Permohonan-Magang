package controllers

import (
	"magang-backend/config"
	"magang-backend/models"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func GetPublishedBidangs(c *gin.Context) {
	rows, err := config.DB.Query("SELECT id, nama, deskripsi, kuota, publish FROM bidang_magangs WHERE publish = '1'")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	var bidangs []models.BidangMagang
	for rows.Next() {
		var b models.BidangMagang
		if err := rows.Scan(&b.ID, &b.Nama, &b.Deskripsi, &b.Kuota, &b.Publish); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		bidangs = append(bidangs, b)
	}

	c.JSON(http.StatusOK, bidangs)
}

func CreateBidang(c *gin.Context) {
	var input models.BidangMagang
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	id := uuid.New().String() // 🔥 generate UUID sendiri

	query := "INSERT INTO bidang_magangs (id, nama, deskripsi, kuota, publish) VALUES (?, ?, ?, ?, ?)"
	_, err := config.DB.Exec(query, id, input.Nama, input.Deskripsi, input.Kuota, input.Publish)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"id": id, "message": "Bidang magang created successfully"})
}

func UpdateBidang(c *gin.Context) {
	id := c.Param("id") // Mendapatkan ID dari parameter URL

	var input models.BidangMagang
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Perbarui data berdasarkan ID
	query := "UPDATE bidang_magangs SET nama = ?, deskripsi = ?, kuota = ?, publish = ? WHERE id = ?"
	_, err := config.DB.Exec(query, input.Nama, input.Deskripsi, input.Kuota, input.Publish, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Bidang magang updated successfully"})
}

func DeleteBidang(c *gin.Context) {
	id := c.Param("id")

	// Cek apakah bidang magang digunakan di tabel magangs
	var count int
	err := config.DB.QueryRow("SELECT COUNT(*) FROM magangs WHERE bidang_magang_id = ?", id).Scan(&count)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengecek relasi dengan data magang"})
		return
	}

	if count > 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Tidak bisa menghapus bidang magang karena masih digunakan di data magang"})
		return
	}

	// Hapus dari DB
	_, err = config.DB.Exec("DELETE FROM bidang_magangs WHERE id = ?", id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghapus bidang magang"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Bidang magang berhasil dihapus"})
}
