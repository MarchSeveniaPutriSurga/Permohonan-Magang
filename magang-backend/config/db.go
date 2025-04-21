package config

import (
	"database/sql"
	"fmt"
	"log"

	_ "github.com/go-sql-driver/mysql"
)

var DB *sql.DB

func ConnectDB() {
	var err error
	dsn := "root:@tcp(127.0.0.1:3306)/homestead"
	DB, err = sql.Open("mysql", dsn)
	if err != nil {
		log.Fatal("Gagal koneksi ke database:", err)
	}

	err = DB.Ping()
	if err != nil {
		log.Fatal("Gagal ping ke database:", err)
	}

	fmt.Println("Koneksi ke database berhasil!")
}
