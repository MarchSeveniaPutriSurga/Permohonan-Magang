package main

import (
	"magang-backend/config"
	"magang-backend/routes"

	"github.com/gin-gonic/gin"
)

func main() {
	config.ConnectDB()
	router := gin.Default()

	// Middleware CORS
	router.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, Authorization")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	router.Static("/uploads", "./uploads")

	routes.SetupRoutes(router)
	router.Run(":8080")
}
