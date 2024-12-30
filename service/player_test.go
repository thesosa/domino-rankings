package service

import (
	"database/sql"
	"fmt"
	"testing"
)

func TestNewPlayerService(t *testing.T) {
	db, err := sql.Open("sqlite3", "../test.db?cache=shared")
	if err != nil {
		t.Fatalf("could not connect to database: %s", err)
	}
	playerService := NewPlayerService(db)
	if playerService.db != db {
		t.Fail()
	}
}

func TestLoadPlayers(t *testing.T) {
	t.Cleanup(func() {
		db.Exec("DELETE FROM players")
	})
	// setup
	for id := 1; id <= 10; id++ {
		var name = fmt.Sprintf("Test Player %d", id)
		_, err := db.Exec("INSERT INTO player (id, name) VALUES ($1, $2)", id, name)
		if err != nil {
			t.Fatal(err)
		}
	}
	playerService := &PlayerService{db: db}
	// run
	players := playerService.LoadPlayers()
	// checks
	if *players[0].ID != 1 {
		t.Fatalf("Expected results to be sorted by name in ascending order")
	}
	if *players[1].ID != 10 {
		t.Fatalf("Expected results to be sorted by name in ascending order")
	}
	for id, player := range players[2:] {
		if *player.ID != int64(id+2) {
			t.Fatalf("Expected player to have ID %d instead got %d", id, *player.ID)
		}
		var expectedName = fmt.Sprintf("Test Player %d", id+2)
		if player.Name != expectedName {
			t.Fatalf("Expected player to have name %s instead got %s", expectedName, player.Name)
		}
	}
}

func TestSavePlayers(t *testing.T) {
	t.Cleanup(func() {
		db.Exec("DELETE FROM players")
	})
	var countQuery = "SELECT count(*) FROM player"
	rowCount := db.QueryRow(countQuery)
	var beforeCount int
	err := rowCount.Scan(&beforeCount)
	if err != nil {
		t.Fatal(err)
	}
	playerService := &PlayerService{db: db}
	var expectedName = "Test Player saved"
	savedPlayer := playerService.SavePlayer(expectedName)
	if savedPlayer.ID == nil {
		t.Fatalf("Expected saved player to have an ID")
	}
	if savedPlayer.Name != expectedName {
		t.Fatal("Saved player does not have the expected name")
	}
	secondRowCount := db.QueryRow(countQuery)
	var afterCount int
	err = secondRowCount.Scan(&afterCount)
	if err != nil {
		t.Fatal(err)
	}
	if beforeCount != afterCount-1 {
		t.Fatal("Expected count to have increased by 1")
	}
}
