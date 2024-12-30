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

// The database handle
var db *sql.DB

// The path to the db file
func DBPath() string {
	if runtime.GOOS != "windows" {
		return "./domino-data.db"
	}
	log.Println("Running on Windows. Using user's cache directory to store db file.")
	userCacheDir, err := os.UserCacheDir()
	if err != nil {
		log.Fatal(err)
	}
	dbDir := userCacheDir + "\\domino-ranks"
	err = os.Mkdir(dbDir, os.ModeDir)
	if err != nil && !os.IsExist(err) {
		log.Fatal(err)
	}
	return dbDir + "\\domino-data.db"
}

func InitDB(dbPath string) (*sql.DB, error) {
	log.Printf("Initializing database file in %s\n", dbPath)
	var err error
	db, err = sql.Open("sqlite3", dbPath)
	if err != nil {
		return nil, err
	}

	err = createPlayerTable(db)
	if err != nil {
		return nil, err
	}

	err = createMatchTable(db)
	if err != nil {
		return nil, err
	}
	log.Println("Database initialized!")
	return db, nil
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
