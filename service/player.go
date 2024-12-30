package service

import (
	"database/sql"
	"domino-ranks/model"
	"log"
)

const (
	loadPlayersQuery = "SELECT id, name FROM player ORDER BY name ASC"
	savePlayerQuery  = "INSERT INTO player (name) VALUES ($1) RETURNING *"
)

type PlayerService struct {
	db *sql.DB
}

func NewPlayerService(db *sql.DB) *PlayerService {
	return &PlayerService{db: db}
}

func (s *PlayerService) LoadPlayers() []*model.Player {
	players := make([]*model.Player, 0)
	rows, err := s.db.Query(loadPlayersQuery)
	if err != nil {
		log.Fatal(err)
	}
	defer rows.Close()
	for rows.Next() {
		var player = new(model.Player)
		rows.Scan(&player.ID, &player.Name)
		players = append(players, player)
	}
	return players
}

func (s *PlayerService) SavePlayer(name string) *model.Player {
	log.Printf("Saving player %s\n", name)
	stmt, err := s.db.Prepare(savePlayerQuery)
	if err != nil {
		log.Fatal(err)
	}

	row := stmt.QueryRow(name)
	var player = new(model.Player)
	err = row.Scan(&player.ID, &player.Name)
	if err != nil {
		log.Fatal(err)
	}
	return player
}
