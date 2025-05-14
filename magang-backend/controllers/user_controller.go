package controllers

import (
	"magang-backend/config"
	"magang-backend/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

// GetUserProfile returns the current user's profile
func GetUserProfile(c *gin.Context) {
	userID, _ := c.Get("userID")

	var user models.User
	if err := config.DB.Select("id, name, email, created_at, updated_at").Where("id = ?", userID).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"user": user})
}
