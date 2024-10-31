package main

import (
	"database/sql"
	"log"
)

const createPlayerTableQuery = "CREATE TABLE IF NOT EXISTS player (id INTEGER PRIMARY KEY, name TEXT UNIQUE NOT NULL)"
const createMatchTableQuery = "CREATE TABLE IF NOT EXISTS match (id INTEGER PRIMARY KEY, match_date DATE NOT NULL, player1 TEXT NOT NULL, player2 TEXT NOT NULL, player3 TEXT NOT NULL, player4 TEXT NOT NULL, teamAPoints INTEGER NOT NULL, teamBPoints INTEGER NOT NULL)"

func InitDB() {
	log.Println("Initializing database...")
	db, err := sql.Open("sqlite3", "./test.db")
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
	log.Println("Creating player table")
	_, err := db.Exec(createPlayerTableQuery)
	return err
}

func createMatchTable(db *sql.DB) error {
	log.Println("Creating match table")
	_, err := db.Exec(createMatchTableQuery)
	return err
}
