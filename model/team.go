package model

type Team struct {
	Player1 Player
	Player2 Player
}

func NewTeam(player1 Player, player2 Player) Team {
	return Team{Player1: player1, Player2: player2}
}

func (t *Team) Equals(other *Team) bool {
	t1 := []string{t.Player1.Name, t.Player2.Name}
	t2 := []string{other.Player1.Name, other.Player2.Name}
	for _, t1Player := range t1 {
		var found bool = false
		for _, t2Player := range t2 {
			if t1Player == t2Player {
				found = true
				break
			}
		}
		if !found {
			return false
		}
	}
	return true
}
