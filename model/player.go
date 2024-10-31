package model

// A Domino player
type Player struct {
	// the player's name
	Name string
}

func NewPlayer(name string) Player {
	return Player{Name: name}
}

func (p *Player) Equals(other *Player) bool {
	return p.Name == other.Name
}
