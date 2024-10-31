package service

import (
	"database/sql"
	"domino-ranks/model"
	"log"

	_ "github.com/mattn/go-sqlite3"
)

type PlayerService struct{}

func (service *PlayerService) LoadPlayers() []*model.Player {
	db, err := sql.Open("sqlite3", "./test.db")
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()
	players := make([]*model.Player, 0)
	rows, err := db.Query("SELECT name FROM player ORDER BY name ASC")
	if err != nil {
		log.Fatal(err)
	}
	defer rows.Close()
	for rows.Next() {
		var player = new(model.Player)
		rows.Scan(&player.Name)
		players = append(players, player)
	}
	return players
}

func (service *PlayerService) SavePlayer(name string) *model.Player {
	db, err := sql.Open("sqlite3", "./test.db")
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	stmt, err := db.Prepare("INSERT INTO player VALUES ($1) RETURNING *")
	if err != nil {
		log.Fatal(err)
	}

	row := stmt.QueryRow(name)
	var player = new(model.Player)
	err = row.Scan(&player.Name)
	if err != nil {
		log.Fatal(err)
	}
	return player
}
