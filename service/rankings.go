package service

import (
	"domino-ranks/model"
	"encoding/csv"
	"os"
	"slices"
	"strconv"
)

type RankingService struct {
	PlayerService *PlayerService
	MatchService  *MatchService
}

func (rService *RankingService) SaveRankingsCSV(fileName string) error {
	// create file
	file, err := os.Create(fileName)
	if err != nil {
		return err
	}
	defer file.Close()
	csvWriter := csv.NewWriter(file)
	defer csvWriter.Flush()
	// load players
	players := rService.PlayerService.LoadPlayers()
	// load matches data
	matches := rService.MatchService.LoadMatches()
	// build player rankings
	rankings := make([]*model.PlayerRanking, len(players))
	for i, player := range players {
		rankings[i] = &model.PlayerRanking{
			Player:       player,
			TotalMatches: 0,
			Victories:    0,
			PointsEarned: 0,
			PointsLost:   0,
		}
	}
	for _, match := range matches {
		// first, extract the relevant ranking objects
		var playerA1Ranking *model.PlayerRanking
		var playerA2Ranking *model.PlayerRanking
		var playerB1Ranking *model.PlayerRanking
		var playerB2Ranking *model.PlayerRanking
		for _, ranking := range rankings {
			if match.TeamA.Player1.Name == ranking.Player.Name {
				playerA1Ranking = ranking
			}
			if match.TeamA.Player2.Name == ranking.Player.Name {
				playerA2Ranking = ranking
			}
			if match.TeamB.Player1.Name == ranking.Player.Name {
				playerB1Ranking = ranking
			}
			if match.TeamB.Player2.Name == ranking.Player.Name {
				playerB2Ranking = ranking
			}
		}

		// figure out which team won
		teamAWon := match.TeamAPoints == 200
		if teamAWon {
			// team A
			playerA1Ranking.TotalMatches++
			playerA2Ranking.TotalMatches++
			playerA1Ranking.Victories++
			playerA2Ranking.Victories++
			playerA1Ranking.PointsEarned += match.TeamAPoints
			playerA2Ranking.PointsEarned += match.TeamAPoints
			playerA1Ranking.PointsLost += match.TeamBPoints
			playerA2Ranking.PointsLost += match.TeamBPoints

			// team B
			playerB1Ranking.TotalMatches++
			playerB2Ranking.TotalMatches++
			playerB1Ranking.PointsEarned += match.TeamBPoints
			playerB2Ranking.PointsEarned += match.TeamBPoints
			playerB1Ranking.PointsLost += match.TeamAPoints
			playerB2Ranking.PointsLost += match.TeamAPoints
		} else {
			// team A
			playerA1Ranking.TotalMatches++
			playerA2Ranking.TotalMatches++
			playerA1Ranking.PointsEarned += match.TeamAPoints
			playerA2Ranking.PointsEarned += match.TeamAPoints
			playerA1Ranking.PointsLost += match.TeamBPoints
			playerA2Ranking.PointsLost += match.TeamBPoints

			// team B
			playerB1Ranking.TotalMatches++
			playerB2Ranking.TotalMatches++
			playerB1Ranking.Victories++
			playerB2Ranking.Victories++
			playerB1Ranking.PointsEarned += match.TeamBPoints
			playerB2Ranking.PointsEarned += match.TeamBPoints
			playerB1Ranking.PointsLost += match.TeamAPoints
			playerB2Ranking.PointsLost += match.TeamAPoints
		}
	}
	// sort rankings
	compareRankings := func(a *model.PlayerRanking, b *model.PlayerRanking) int {
		victoriesDiff := int(b.Victories) - int(a.Victories)
		if victoriesDiff == 0 {
			matchesDiff := int(b.TotalMatches) - int(a.TotalMatches)
			if matchesDiff == 0 {
				return (int(b.PointsEarned) - int(b.PointsLost)) - (int(a.PointsEarned) - int(a.PointsLost))
			}
			return matchesDiff
		}
		return int(victoriesDiff)
	}
	slices.SortFunc(rankings, compareRankings)
	// make csv records
	records := [][]string{
		{"Jugador", "Nombre", "PJ", "PG", "PP", "PTOS. G", "PTOS. P", "DIF.", "EFECT."},
	}
	for i, ranking := range rankings {
		losses := ranking.TotalMatches - ranking.Victories
		pointsDiff := ranking.PointsEarned - ranking.PointsLost
		var effectiveness int64
		if ranking.TotalMatches == 0 {
			effectiveness = 0
		} else {
			effectiveness = ranking.Victories / ranking.TotalMatches
		}
		row := []string{strconv.FormatInt(int64(i+1), 10), ranking.Player.Name, strconv.FormatInt(ranking.TotalMatches, 10), strconv.FormatInt(ranking.Victories, 10), strconv.FormatInt(losses, 10), strconv.FormatInt(ranking.PointsEarned, 10), strconv.FormatInt(ranking.PointsLost, 10), strconv.FormatInt(pointsDiff, 10), strconv.FormatInt(effectiveness, 10)}
		records = append(records, row)
	}
	// write rankings to file
	return csvWriter.WriteAll(records)
}