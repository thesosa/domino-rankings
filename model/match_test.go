package model

import (
	"testing"
	"time"
)

func TestNewMatch(t *testing.T) {
	var matchDate = time.Date(2001, time.September, 11, 13, 13, 0, 0, time.UTC)
	var playerA1 = Player{ID: new(int64), Name: "Player A1"}
	var playerA2 = Player{ID: new(int64), Name: "Player A2"}
	var playerB1 = Player{ID: new(int64), Name: "Player B1"}
	var playerB2 = Player{ID: new(int64), Name: "Player B2"}
	var teamA = Team{Player1: playerA1, Player2: playerA2}
	var teamB = Team{Player1: playerB1, Player2: playerB2}
	var teamAPoints int64 = 200
	var teamBPoints int64 = 120

	match := NewMatch(matchDate, teamA, teamB, teamAPoints, teamBPoints)
	if match.ID != nil {
		t.Fail()
	}
	if match.MatchDate != matchDate {
		t.Fail()
	}
	if match.TeamA != teamA {
		t.Fail()
	}
	if match.TeamB != teamB {
		t.Fail()
	}
	if match.TeamAPoints != teamAPoints {
		t.Fail()
	}
	if match.TeamBPoints != teamBPoints {
		t.Fail()
	}
}
