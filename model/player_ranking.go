package model

type PlayerRanking struct {
	Player       *Player
	TotalMatches int64
	Victories    int64
	PointsEarned int64
	PointsLost   int64
}
