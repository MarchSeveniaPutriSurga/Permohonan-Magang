package controllers

import (
	"magang-backend/config"
	"magang-backend/models"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func GetDashboardStats(c *gin.Context) {
	var totalPendaftar int64
	var magangAktif int64
	var totalBidang int64
	var bidangTersedia int64

	// Total Pendaftar
	config.DB.Model(&models.Magang{}).Count(&totalPendaftar)

	// Magang Aktif
	config.DB.Model(&models.Magang{}).Where("status_magang = ?", "Aktif").Count(&magangAktif)

	// Total Bidang
	config.DB.Model(&models.BidangMagang{}).Count(&totalBidang)

	// Bidang tersedia
	var bidangs []models.BidangMagangWithCount
	query := `
		SELECT 
			b.id, b.nama AS nama_bidang, b.kuota, 
			COALESCE(m.count, 0) AS jumlah_magang
		FROM bidang_magangs b
		LEFT JOIN (
			SELECT bidang_magang_id, COUNT(*) AS count
			FROM magangs
			WHERE status_magang = 'Aktif'
			GROUP BY bidang_magang_id
		) m ON b.id = m.bidang_magang_id
		WHERE b.publish = 1;
		`
	if err := config.DB.Raw(query).Scan(&bidangs).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghitung bidang tersedia"})
		return
	}
	for _, b := range bidangs {
		if b.JumlahMagang < b.Kuota {
			bidangTersedia++
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"totalPendaftar":         totalPendaftar,
		"magangAktif":            magangAktif,
		"bidangTersedia":         bidangTersedia,
		"distribusiBidangMagang": totalBidang,
	})
}

func GetPendaftaranChart(c *gin.Context) {
	var result []struct {
		Bulan string
		Total int
	}
	query := `
	SELECT DATE_FORMAT(start_date, '%m') AS bulan, COUNT(*) as total
	FROM magangs
	GROUP BY bulan
	ORDER BY bulan ASC
	`
	if err := config.DB.Raw(query).Scan(&result).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data chart"})
		return
	}

	data := make([]int, 12)
	for _, r := range result {
		index, _ := strconv.Atoi(r.Bulan)
		data[index-1] = r.Total
	}

	c.JSON(http.StatusOK, data)
}

func GetBidangDistribusi(c *gin.Context) {
	var result []struct {
		NamaBidang string
		Total      int
	}
	query := `
	SELECT b.nama AS nama_bidang, COUNT(m.id) as total
	FROM bidang_magangs b
	LEFT JOIN magangs m ON m.bidang_magang_id = b.id AND m.status_magang = 'Aktif'
	GROUP BY b.nama
	ORDER BY total DESC
	`
	if err := config.DB.Raw(query).Scan(&result).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data distribusi"})
		return
	}

	labels := []string{}
	data := []int{}
	for _, item := range result {
		labels = append(labels, item.NamaBidang)
		data = append(data, item.Total)
	}

	c.JSON(http.StatusOK, gin.H{
		"labels": labels,
		"data":   data,
	})
}
