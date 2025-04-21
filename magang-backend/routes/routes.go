package routes

import (
	"magang-backend/controllers"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(router *gin.Engine) {
	api := router.Group("/api")
	{
		api.GET("/bidangs", controllers.GetPublishedBidangs)
		api.POST("/bidangs", controllers.CreateBidang)
		api.PUT("/bidangs/:id", controllers.UpdateBidang)
		api.DELETE("/bidangs/:id", controllers.DeleteBidang)
		api.POST("/magang", controllers.CreateMagang)
		api.GET("/magang", controllers.GetAllMagangs)
		api.PUT("/magang/:id/status", controllers.UpdateMagangStatus)
		api.GET("/magang/kuota", controllers.GetUsedQuota)
	}
}
