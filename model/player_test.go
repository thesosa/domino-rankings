package model

import "testing"

func TestNewPlayer(t *testing.T) {
	var name = "test name"
	var player = NewPlayer(name)
	if player.ID != nil {
		t.Fail()
	}
	if player.Name != name {
		t.Fail()
	}
}

func TestPlayerEquals(t *testing.T) {
	var player1Id int64 = 1
	var player2Id int64 = 2
	var player3Id int64 = 3
	var player1 = Player{ID: &player1Id, Name: "Test Name"}
	var player2 = Player{ID: &player2Id, Name: "Test Name"}
	var player3 = Player{ID: &player3Id, Name: "Different Test Name"}
	if !player1.Equals(&player2) {
		t.Fail()
	}
	if player1.Equals(&player3) {
		t.Fail()
	}
}
