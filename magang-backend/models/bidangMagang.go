package models

type BidangMagang struct {
	ID        string `json:"id"`
	Nama      string `json:"nama"`
	Deskripsi string `json:"deskripsi"`
	Kuota     int    `json:"kuota"`
	Publish   string `json:"publish"`
}

type BidangMagangWithCount struct {
	ID           string `json:"id"`
	NamaBidang   string `json:"nama_bidang"`
	Kuota        int    `json:"kuota"`
	JumlahMagang int    `json:"jumlah_magang"`
}
