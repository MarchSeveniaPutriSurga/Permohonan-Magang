package controllers

import (
	"magang-backend/config"
	"magang-backend/models"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// GetAllBidangs mengembalikan semua bidang magang untuk admin dashboard
func GetAllBidangs(c *gin.Context) {
	var bidangs []models.BidangMagang
	err := config.DB.Raw("SELECT id, nama, deskripsi, kuota, publish FROM bidang_magangs").Scan(&bidangs).Error
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, bidangs)
}

// GetPublishedBidangs mengembalikan bidang magang yang dipublish untuk user
func GetPublishedBidangs(c *gin.Context) {
	var bidangs []models.BidangMagang
	err := config.DB.Raw("SELECT id, nama, deskripsi, kuota, publish FROM bidang_magangs WHERE publish = ?", 1).Scan(&bidangs).Error
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, bidangs)
}

// CreateBidang menambahkan bidang magang baru
func CreateBidang(c *gin.Context) {
	var input models.BidangMagang

	// Bind JSON ke struct
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Buat ID baru dengan UUID
	input.ID = uuid.New().String()

	// Simpan ke DB
	if err := config.DB.Create(&input).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, input)
}

// UpdateBidang mengubah data bidang magang berdasarkan ID
func UpdateBidang(c *gin.Context) {
	id := c.Param("id")

	var bidang models.BidangMagang
	if err := config.DB.First(&bidang, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Bidang not found"})
		return
	}

	var input models.BidangMagang
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Update fields
	bidang.Nama = input.Nama
	bidang.Deskripsi = input.Deskripsi
	bidang.Kuota = input.Kuota
	bidang.Publish = input.Publish

	if err := config.DB.Save(&bidang).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, bidang)
}

// DeleteBidang menghapus bidang magang berdasarkan ID
func DeleteBidang(c *gin.Context) {
	id := c.Param("id")

	if err := config.DB.Delete(&models.BidangMagang{}, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Bidang deleted successfully"})
}
