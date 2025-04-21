package models

type BidangMagang struct {
	ID        string `json:"id"`
	Nama      string `json:"nama"`
	Deskripsi string `json:"deskripsi"`
	Kuota     string `json:"kuota"`
	Publish   string `json:"publish"`
}
