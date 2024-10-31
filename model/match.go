package model

import "time"

type Match struct {
	ID          *int64
	MatchDate   time.Time
	TeamA       Team
	TeamB       Team
	TeamAPoints int64
	TeamBPoints int64
}

func NewMatch(date time.Time, teamA, teamB Team, teamAPoints int64, teamBPoints int64) Match {
	return Match{
		MatchDate:   date,
		TeamA:       teamA,
		TeamB:       teamB,
		TeamAPoints: teamAPoints,
		TeamBPoints: teamBPoints,
	}
}
