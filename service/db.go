package service

import (
	"database/sql"
	"log"
	"os"
	"runtime"

	_ "github.com/ncruces/go-sqlite3/driver"
	_ "github.com/ncruces/go-sqlite3/embed"
)

const createPlayerTableQuery = "CREATE TABLE IF NOT EXISTS player (id INTEGER PRIMARY KEY, name TEXT UNIQUE NOT NULL)"
const createMatchTableQuery = "CREATE TABLE IF NOT EXISTS match (id INTEGER PRIMARY KEY, match_date DATE NOT NULL, player1 TEXT NOT NULL, player2 TEXT NOT NULL, player3 TEXT NOT NULL, player4 TEXT NOT NULL, teamAPoints INTEGER NOT NULL, teamBPoints INTEGER NOT NULL)"

var dbPath string

func SetDBPath(path string) {
	dbPath = path
	log.Printf("DB path set to: %s\n", dbPath)
}

func GetDBPath() string {
	return dbPath
}

func InitDB() {
	log.Println("Initializing database...")
	if dbPath == "" {
		SetDBPath("./domino-data.db")
		if runtime.GOOS == "windows" {
			log.Println("Running on Windows. Using user's cache directory to store db file.")
			userCacheDir, err := os.UserCacheDir()
			if err != nil {
				log.Fatalln(err)
			}
			SetDBPath(userCacheDir + "/domino-ranks/domino-data.db")
		}
	}
	db, err := sql.Open("sqlite3", GetDBPath())
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	err = createPlayerTable(db)
	if err != nil {
		log.Fatal(err)
	}

	err = createMatchTable(db)
	if err != nil {
		log.Fatal(err)
	}
	log.Println("Database initialized!")
}

func createPlayerTable(db *sql.DB) error {
	log.Println("Creating player table, if it does not exist")
	_, err := db.Exec(createPlayerTableQuery)
	return err
}

func createMatchTable(db *sql.DB) error {
	log.Println("Creating match table, if it does not exist")
	_, err := db.Exec(createMatchTableQuery)
	return err
}
