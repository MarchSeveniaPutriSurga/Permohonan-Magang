package models

import "time"

type Magang struct {
	ID             string    `json:"id"`
	Nama           string    `json:"nama"`
	Keperluan      string    `json:"keperluan"`
	Instansi       string    `json:"instansi"`
	NoHP           string    `json:"no_hp"`
	Alamat         string    `json:"alamat"`
	StartDate      time.Time `json:"start_date"`
	EndDate        time.Time `json:"end_date"`
	Dokumen        string    `json:"dokumen"`
	BidangMagangID string    `json:"bidang_magang_id"`
	StatusMagang   string    `json:"status_magang"`
}
