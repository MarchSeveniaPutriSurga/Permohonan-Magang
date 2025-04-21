package models

type Magang struct {
	ID             string `json:"id"`
	Nama           string `json:"nama"`
	Keperluan      string `json:"keperluan"`
	Instansi       string `json:"instansi"`
	NoHP           string `json:"no_hp"`
	Alamat         string `json:"alamat"`
	StartDate      string `json:"start_date"`
	EndDate        string `json:"end_date"`
	Dokumen        string `json:"dokumen"`
	BidangMagangID string `json:"bidang_magang_id"`
	StatusMagang   string `json:"status_magang"`
}
