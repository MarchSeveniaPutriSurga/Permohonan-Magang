package controllers

import (
	"magang-backend/config"
	"magang-backend/models"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// mengembalikan semua bidang magang yang dipublikasikan
func GetPublishedBidangs(c *gin.Context) {
	var bidangs []models.BidangMagang
	err := config.DB.Raw("SELECT id, nama, deskripsi, kuota, publish FROM bidang_magangs WHERE publish = ?", 1).Scan(&bidangs).Error
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, bidangs)
}

// membuat bidang magang baru
func CreateBidang(c *gin.Context) {
	var input models.BidangMagang
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	id := uuid.New().String()

	result := config.DB.Exec("INSERT INTO bidang_magangs (id, nama, deskripsi, kuota, publish) VALUES (?, ?, ?, ?, ?)", id, input.Nama, input.Deskripsi, input.Kuota, input.Publish)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"id": id, "message": "Bidang magang created successfully"})
}

// mengupdate data bidang magang berdasarkan ID
func UpdateBidang(c *gin.Context) {
	id := c.Param("id")
	var input models.BidangMagang
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	result := config.DB.Exec("UPDATE bidang_magangs SET nama = ?, deskripsi = ?, kuota = ?, publish = ? WHERE id = ?", input.Nama, input.Deskripsi, input.Kuota, input.Publish, id)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Bidang magang updated successfully"})
}

// menghapus bidang magang berdasarkan ID
func DeleteBidang(c *gin.Context) {
	id := c.Param("id")

	result := config.DB.Exec("DELETE FROM bidang_magangs WHERE id = ?", id)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Bidang magang deleted successfully"})
}
