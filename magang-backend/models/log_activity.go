package models

import "time"

type LogActivity struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	UserID      uint      `json:"user_id"`
	User        User      `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"user"`
	Tanggal     time.Time `json:"tanggal"`
	Deskripsi   string    `gorm:"type:text" json:"deskripsi"`
	Dokumentasi string    `gorm:"type:varchar(255)" json:"dokumentasi"`
	Status      string    `gorm:"type:enum('pending','disetujui','ditolak');default:'pending'" json:"status"`
	QRCodeURL   string    `gorm:"type:varchar(255)" json:"qr_code_url"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}
