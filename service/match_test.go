package service

import (
	"database/sql"
	"domino-ranks/model"
	"testing"
	"time"
)

func TestNewMatchService(t *testing.T) {
	matchService := NewMatchService(db)
	if matchService.db != db {
		t.Fail()
	}
}

func TestSaveMatch(t *testing.T) {
	t.Cleanup(func() {
		db.Exec("DELETE FROM match")
	})
	var countQuery = "SELECT count(*) FROM match"
	rowCount := db.QueryRow(countQuery)
	var beforeCount int
	if err := rowCount.Scan(&beforeCount); err != nil {
		t.Fatal(err)
	}
	matchService := &MatchService{db: db}
	matchDate := time.Date(2001, time.September, 11, 13, 13, 0, 0, time.UTC)
	var teamAPoints int64 = 200
	var teamBPoints int64 = 110
	var playerA1 = model.Player{Name: "Player A1"}
	var playerA2 = model.Player{Name: "Player A2"}
	var playerB1 = model.Player{Name: "Player B1"}
	var playerB2 = model.Player{Name: "Player B2"}
	var teamA = model.Team{Player1: playerA1, Player2: playerA2}
	var teamB = model.Team{Player1: playerB1, Player2: playerB2}
	var matchToSave = model.Match{
		MatchDate:   matchDate,
		TeamA:       teamA,
		TeamB:       teamB,
		TeamAPoints: teamAPoints,
		TeamBPoints: teamBPoints,
	}
	savedMatch := matchService.SaveMatch(&matchToSave)
	if savedMatch.ID == nil {
		t.Fatalf("Expected saved match to have an ID")
	}
	if savedMatch.MatchDate != matchDate {
		t.Fatalf("Expected match date to be %s instead it was %s", matchDate, savedMatch.MatchDate)
	}
	if savedMatch.TeamA.Player1.Name != playerA1.Name {
		t.Fatalf("Team A Player 1 is expected to be %s, but was %s", playerA1.Name, savedMatch.TeamA.Player1.Name)
	}
	if savedMatch.TeamA.Player2.Name != playerA2.Name {
		t.Fatalf("Team A Player 2 is expected to be %s, but was %s", playerA2.Name, savedMatch.TeamA.Player2.Name)
	}
	if savedMatch.TeamB.Player1.Name != playerB1.Name {
		t.Fatalf("Team B Player 1 is expected to be %s, but was %s", playerB1.Name, savedMatch.TeamB.Player1.Name)
	}
	if savedMatch.TeamB.Player2.Name != playerB2.Name {
		t.Fatalf("Team B Player 2 is expected to be %s, but was %s", playerB2.Name, savedMatch.TeamB.Player2.Name)
	}
	if savedMatch.TeamAPoints != teamAPoints {
		t.Fatalf("Team A points is %d instead of the expected %d", savedMatch.TeamAPoints, teamAPoints)
	}
	if savedMatch.TeamBPoints != teamBPoints {
		t.Fatalf("Team B points is %d instead of the expected %d", savedMatch.TeamBPoints, teamBPoints)
	}
	secondRowCount := db.QueryRow(countQuery)
	var afterCount int
	if err := secondRowCount.Scan(&afterCount); err != nil {
		t.Fatal(err)
	}
	if beforeCount != afterCount-1 {
		t.Fatal("Expected count to have increased by 1")
	}
}

func TestLoadMatches(t *testing.T) {
	t.Cleanup(func() {
		db.Exec("DELETE FROM match")
	})
	// setup
	for id := 1; id <= 10; id++ {
		matchDate := time.Date(2001, time.September, id, 10, 0, 0, 0, time.UTC)
		playerA1 := "Player A1"
		playerA2 := "Player A2"
		playerB1 := "Player B1"
		playerB2 := "Player B2"
		teamAPoints := 200
		teamBPoints := 20
		_, err := db.Exec("INSERT INTO match (match_date, player1, player2, player3, player4, teamAPoints, teamBPoints) VALUES ($1, $2, $3, $4, $5, $6, $7)", matchDate, playerA1, playerA2, playerB1, playerB2, teamAPoints, teamBPoints)
		if err != nil {
			t.Fatal(err)
		}
	}

	// test
	matchService := &MatchService{db: db}
	loadedMatches := matchService.LoadMatches()

	// checks
	if len(loadedMatches) != 10 {
		t.Fatalf("Expected number of matches to be %d, but instead is %d", 10, len(loadedMatches))
	}
	for i := 0; i < 9; i++ {
		if loadedMatches[i].MatchDate.Before(loadedMatches[i+1].MatchDate) {
			t.Fatal("Expected result to be sorted by date in descending order")
		}
	}

}

func TestDeleteMatch(t *testing.T) {
	t.Cleanup(func() {
		db.Exec("DELETE FROM match")
	})
	// setup
	for id := 1; id <= 10; id++ {
		matchDate := time.Date(2001, time.September, id, 10, 0, 0, 0, time.UTC)
		playerA1 := "Player A1"
		playerA2 := "Player A2"
		playerB1 := "Player B1"
		playerB2 := "Player B2"
		teamAPoints := 200
		teamBPoints := 20
		if _, err := db.Exec("INSERT INTO match (id, match_date, player1, player2, player3, player4, teamAPoints, teamBPoints) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)", id, matchDate, playerA1, playerA2, playerB1, playerB2, teamAPoints, teamBPoints); err != nil {
			t.Fatal(err)
		}
	}
	var countQuery = "SELECT count(*) FROM match"
	rowCount := db.QueryRow(countQuery)
	var beforeCount int
	if err := rowCount.Scan(&beforeCount); err != nil {
		t.Fatal(err)
	}

	// test
	matchService := &MatchService{db: db}
	var deletedMatchID int64 = 4
	matchService.DeleteMatch(deletedMatchID)

	row := db.QueryRow("SELECT * FROM match WHERE id = $1", deletedMatchID)
	if err := row.Scan(); err != sql.ErrNoRows {
		t.Fatal("Expected to have not found deleted entry")
	}

	secondRowCount := db.QueryRow(countQuery)
	var afterCount int
	if err := secondRowCount.Scan(&afterCount); err != nil {
		t.Fatal(err)
	}
	if beforeCount != afterCount+1 {
		t.Fatal("Expected count to have decreased by 1")
	}
}

func TestDeleteAllMatches(t *testing.T) {
	t.Cleanup(func() {
		// maybe not necessary, but leave just in case
		db.Exec("DELETE FROM match")
	})
	// setup
	for id := 1; id <= 10; id++ {
		matchDate := time.Date(2001, time.September, id, 10, 0, 0, 0, time.UTC)
		playerA1 := "Player A1"
		playerA2 := "Player A2"
		playerB1 := "Player B1"
		playerB2 := "Player B2"
		teamAPoints := 200
		teamBPoints := 20
		if _, err := db.Exec("INSERT INTO match (id, match_date, player1, player2, player3, player4, teamAPoints, teamBPoints) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)", id, matchDate, playerA1, playerA2, playerB1, playerB2, teamAPoints, teamBPoints); err != nil {
			t.Fatal(err)
		}
	}
	var countQuery = "SELECT count(*) FROM match"

	// test
	matchService := &MatchService{db: db}
	matchService.DeleteAllMatches()

	secondRowCount := db.QueryRow(countQuery)
	var afterCount int
	if err := secondRowCount.Scan(&afterCount); err != nil {
		t.Fatal(err)
	}
	if afterCount != 0 {
		t.Fatal("Expected count to be 0")
	}
}
