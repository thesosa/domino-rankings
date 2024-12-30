package model

import "testing"

func TestNewTeam(t *testing.T) {
	var player1Id int64 = 1
	var player2Id int64 = 2
	var player1 = Player{ID: &player1Id, Name: "Player 1"}
	var player2 = Player{ID: &player2Id, Name: "Player 2"}
	var team = NewTeam(player1, player2)
	if team.Player1 != player1 {
		t.Fail()
	}
	if team.Player2 != player2 {
		t.Fail()
	}
}

func TestTeamEquals(t *testing.T) {
	var player1Id int64 = 1
	var player2Id int64 = 2
	var player3Id int64 = 3
	var player1 = Player{ID: &player1Id, Name: "Player 1"}
	var player2 = Player{ID: &player2Id, Name: "Player 2"}
	var player3 = Player{ID: &player3Id, Name: "Player 3"}

	var team1 = Team{Player1: player1, Player2: player2}
	var team2 = Team{Player1: player1, Player2: player2}
	var team3 = Team{Player1: player2, Player2: player1}
	var team4 = Team{Player1: player1, Player2: player3}
	var team5 = Team{Player1: player3, Player2: player1}
	var team6 = Team{Player1: player2, Player2: player3}

	if !team1.Equals(&team2) {
		t.Fail()
	}
	if !team1.Equals(&team3) {
		t.Fail()
	}
	if team1.Equals(&team4) {
		t.Fail()
	}
	if team1.Equals(&team5) {
		t.Fail()
	}
	if team1.Equals(&team6) {
		t.Fail()
	}
}
