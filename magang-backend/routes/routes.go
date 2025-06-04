package routes

import (
	"magang-backend/controllers"
	"magang-backend/middleware"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(router *gin.Engine) {
	// Public routes
	router.POST("/register", controllers.Register)
	router.POST("/login", controllers.Login)

	// Protected routes (wajib token)
	protected := router.Group("/")
	protected.Use(middleware.AuthMiddleware())
	{
		// Profil user
		protected.GET("/user/profile", controllers.GetUserProfile)

		// Status magang user login
		protected.GET("/user/magang/status-saya", controllers.GetStatusMagangByUser)

		// Semua endpoint API
		api := protected.Group("/api")
		{
			// Bidang magang
			api.GET("/bidangs", controllers.GetAllBidangs)                 // Menampilkan semua bidang magang (untuk admin)
			api.GET("/bidangs/published", controllers.GetPublishedBidangs) // Menampilkan bidang yang dipublikasikan (untuk user)
			api.POST("/bidangs", controllers.CreateBidang)
			api.PUT("/bidangs/:id", controllers.UpdateBidang)
			api.DELETE("/bidangs/:id", controllers.DeleteBidang)

			// Magang
			api.POST("/magang", controllers.CreateMagang)
			api.GET("/magang", controllers.GetAllMagangs)
			api.PUT("/magang/:id/status", controllers.UpdateMagangStatus)

			// Kuota dan periode
			api.GET("/magang/kuota", controllers.GetUsedQuota)
			api.GET("/magang/periode", controllers.MagangPeriode)

			// Kalender
			api.GET("/kalender/magang", controllers.GetKalenderMagang)
			api.GET("/kalender/magang/:bidang_id/peserta", controllers.GetDetailPesertaMagang)

		}
	}

	admin := router.Group("/admin")
	admin.Use(middleware.AuthMiddleware(), middleware.AdminOnlyMiddleware())
	{
		//admin
		admin.GET("/dashboard/stats", controllers.GetDashboardStats)
		admin.GET("/pendaftaran/chart", controllers.GetPendaftaranChart)
		admin.GET("/bidang/distribusi", controllers.GetBidangDistribusi)
	}
}
