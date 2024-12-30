package service

import (
	"database/sql"
	"domino-ranks/model"
	"log"
)

const saveMatchQuery = "INSERT INTO match (match_date, player1, player2, player3, player4, teamAPoints, teamBPoints) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *"
const selectMatchesQuery = "SELECT id, match_date, player1, player2, player3, player4, teamAPoints, teamBPoints FROM match ORDER BY match_date DESC"
const deleteMatchQuery = "DELETE FROM match WHERE id = $1"
const deleteAllMatchesQuery = "DELETE FROM match"

type MatchService struct {
	db *sql.DB
}

func NewMatchService(db *sql.DB) *MatchService {
	return &MatchService{db: db}
}

func (s *MatchService) SaveMatch(match *model.Match) *model.Match {
	log.Println("Saving new match.")
	row := s.db.QueryRow(saveMatchQuery, match.MatchDate, match.TeamA.Player1.Name, match.TeamA.Player2.Name, match.TeamB.Player1.Name, match.TeamB.Player2.Name, match.TeamAPoints, match.TeamBPoints)
	result := new(model.Match)
	result.TeamA = model.Team{}
	result.TeamB = model.Team{}
	err := row.Scan(&result.ID, &result.MatchDate, &result.TeamA.Player1.Name, &result.TeamA.Player2.Name, &result.TeamB.Player1.Name, &match.TeamB.Player2.Name, &match.TeamAPoints, &match.TeamBPoints)
	if err != nil {
		log.Fatal(err)
	}
	return result
}

func (s *MatchService) LoadMatches() []*model.Match {
	log.Println("Loading matches.")
	matches := make([]*model.Match, 0)
	rows, err := s.db.Query(selectMatchesQuery)
	if err != nil {
		log.Fatal(err)
	}
	for rows.Next() {
		match := new(model.Match)
		match.TeamA = model.Team{Player1: model.Player{}, Player2: model.Player{}}
		match.TeamB = model.Team{Player1: model.Player{}, Player2: model.Player{}}
		err = rows.Scan(&match.ID, &match.MatchDate, &match.TeamA.Player1.Name, &match.TeamA.Player2.Name, &match.TeamB.Player1.Name, &match.TeamB.Player2.Name, &match.TeamAPoints, &match.TeamBPoints)
		if err != nil {
			log.Fatal(err)
		}
		matches = append(matches, match)
	}
	return matches
}

func (s *MatchService) DeleteMatch(id int64) {
	log.Printf("Deleting match %d\n", id)
	_, err := s.db.Exec(deleteMatchQuery, id)
	if err != nil {
		log.Fatal(err)
	}
}

func (s *MatchService) DeleteAllMatches() {
	log.Println("Deleting all matches.")
	_, err := s.db.Exec(deleteAllMatchesQuery)
	if err != nil {
		log.Fatal(err)
	}
}
