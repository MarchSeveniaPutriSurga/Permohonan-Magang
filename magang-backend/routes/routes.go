package routes

import (
	"magang-backend/controllers"
	"magang-backend/middleware"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(router *gin.Engine) {
	// Auth routes
	router.POST("/register", controllers.Register)
	router.POST("/login", controllers.Login)

	// Protected routes
	protected := router.Group("/user")
	protected.Use(middleware.AuthMiddleware())
	{
		protected.GET("/profile", controllers.GetUserProfile)
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
			api.GET("/magang/periode", controllers.MagangPeriode)
		}
	}
}
