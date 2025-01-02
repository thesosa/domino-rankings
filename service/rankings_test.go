package service

import (
	"domino-ranks/model"
	"encoding/csv"
	"os"
	"strconv"
	"testing"
	"time"
)

func TestRankings(t *testing.T) {
	//setup
	t.Cleanup(func() {
		db.Exec("DELETE FROM player")
	})
	t.Cleanup(func() {
		db.Exec("DELETE FROM match")
	})
	// load player data
	playersTestFile, err := os.Open("./test_player_data.csv")
	if err != nil {
		t.Fatal(err)
	}
	playerDataReader := csv.NewReader(playersTestFile)
	playerRecords, err := playerDataReader.ReadAll()
	if err != nil {
		t.Fatal(err)
	}
	playerRecordsLength := len(playerRecords)
	for i := 1; i < playerRecordsLength; i++ {
		record := playerRecords[i]
		var id, err = strconv.ParseInt(record[0], 10, 64)
		if err != nil {
			t.Fatal(err)
		}
		var name string = record[1]
		if _, err = db.Exec("INSERT INTO player VALUES ($1, $2)", id, name); err != nil {
			t.Fatal(err)
		}
	}
	if err = playersTestFile.Close(); err != nil {
		t.Fatal(err)
	}

	// load match data
	matchesTestFile, err := os.Open("./test_match_data.csv")
	if err != nil {
		t.Fatal(err)
	}
	matchDataReader := csv.NewReader(matchesTestFile)
	matchRecords, err := matchDataReader.ReadAll()
	if err != nil {
		t.Fatal(err)
	}
	matchRecordsLength := len(matchRecords)
	for i := 1; i < matchRecordsLength; i++ {
		record := matchRecords[i]
		matchDate, err := time.Parse(time.RFC3339Nano, record[0])
		if err != nil {
			t.Fatal(err)
		}
		playerA1 := record[1]
		playerA2 := record[2]
		playerB1 := record[3]
		playerB2 := record[4]
		teamAPoints, err := strconv.ParseInt(record[5], 10, 64)
		if err != nil {
			t.Fatal(err)
		}
		teamBPoints, err := strconv.ParseInt(record[6], 10, 64)
		if err != nil {
			t.Fatal(err)
		}
		if _, err = db.Exec("INSERT INTO match (match_date, player1, player2, player3, player4, teamAPoints, teamBPoints) VALUES ($1, $2, $3, $4, $5, $6, $7)", matchDate, playerA1, playerA2, playerB1, playerB2, teamAPoints, teamBPoints); err != nil {
			t.Fatal(err)
		}
	}
	if err = matchesTestFile.Close(); err != nil {
		t.Fatal(err)
	}

	t.Run("NewRankingService", func(t *testing.T) {
		playerService := &PlayerService{db: db}
		matchService := &MatchService{db: db}
		rankingService := NewRankingService(playerService, matchService)
		if rankingService.playerService != playerService {
			t.Fail()
		}
		if rankingService.matchService != matchService {
			t.Fail()
		}
	})

	t.Run("Compare rankings function", func(t *testing.T) {
		a := model.PlayerRanking{Victories: 10, TotalMatches: 10, PointsEarned: 200, PointsLost: 100}
		aa := model.PlayerRanking{Victories: 10, TotalMatches: 10, PointsEarned: 300, PointsLost: 100}
		b := model.PlayerRanking{Victories: 10, TotalMatches: 20}
		d := model.PlayerRanking{Victories: 20, TotalMatches: 50}
		var result int
		// same amount of victories and matches, different point difference
		result = compareRankings(&a, &aa)
		if result <= 0 {
			t.Fail()
		}
		result = compareRankings(&aa, &a)
		if result > 0 {
			t.Fail()
		}
		// same amount of victories, different amount of matches
		result = compareRankings(&a, &b)
		if result <= 0 {
			t.Fail()
		}
		result = compareRankings(&b, &a)
		if result > 0 {
			t.Fail()
		}
		// different amount of victories
		result = compareRankings(&a, &d)
		if result <= 0 {
			t.Fail()
		}
		result = compareRankings(&d, &a)
		if result > 0 {
			t.Fail()
		}
	})

	t.Run("Map rankings to CSV function", func(t *testing.T) {
		mario := model.Player{Name: "Mario"}
		luigi := model.Player{Name: "Luigi"}
		wario := model.Player{Name: "Wario"}
		waluigi := model.Player{Name: "Waluigi"}
		zero := model.Player{Name: "Zero"}
		marioRanking := &model.PlayerRanking{Player: &mario, TotalMatches: 10, Victories: 9, PointsEarned: 1890, PointsLost: 1540}
		luigiRanking := &model.PlayerRanking{Player: &luigi, TotalMatches: 10, Victories: 6, PointsEarned: 1410, PointsLost: 1020}
		warioRanking := &model.PlayerRanking{Player: &wario, TotalMatches: 10, Victories: 1, PointsEarned: 420, PointsLost: 1800}
		waluigiRanking := &model.PlayerRanking{Player: &waluigi, TotalMatches: 10, Victories: 4, PointsEarned: 1110, PointsLost: 1200}
		// to make sure there are no division by 0
		zeroRanking := &model.PlayerRanking{Player: &zero, TotalMatches: 0, Victories: 0, PointsEarned: 0, PointsLost: 0}
		rankings := []*model.PlayerRanking{marioRanking, luigiRanking, warioRanking, waluigiRanking, zeroRanking}
		records := mapRankingsToCSVRecords(rankings)
		// check header row
		headerRow := records[0]
		headerCells := []string{"Jugador", "Nombre", "PJ", "PG", "PP", "PTOS. G", "PTOS. P", "DIF.", "EFECT."}
		for i, headerCell := range headerCells {
			if headerRow[i] != headerCell {
				t.Fatalf("Expected header cell with value: %s, instead got: %s", headerCell, headerRow[i])
			}
		}
		// check contents
		if len(records) < len(rankings)+1 {
			t.FailNow()
		}
		for i := 1; i < len(records); i++ {
			record := records[i]
			ranking := rankings[i-1]
			if record[0] != strconv.FormatInt(int64(i), 10) {
				t.Fatalf("Expected value: %d, instead got: %s", i, record[0])
			}
			if record[1] != ranking.Player.Name {
				t.Fatalf("Expected value: %s, instead got: %s", ranking.Player.Name, record[1])
			}
			if record[2] != strconv.FormatInt(ranking.TotalMatches, 10) {
				t.Fatalf("Expected value: %d, instead got: %s", ranking.TotalMatches, record[2])
			}
			if record[3] != strconv.FormatInt(ranking.Victories, 10) {
				t.Fatalf("Expected value: %d, instead got: %s", ranking.Victories, record[3])
			}
			if record[4] != strconv.FormatInt(ranking.TotalMatches-ranking.Victories, 10) {
				t.Fatalf("Expected value: %d, instead got: %s", ranking.TotalMatches-ranking.Victories, record[4])
			}
			if record[5] != strconv.FormatInt(ranking.PointsEarned, 10) {
				t.Fatalf("Expected value: %d, instead got: %s", ranking.PointsEarned, record[5])
			}
			if record[6] != strconv.FormatInt(ranking.PointsLost, 10) {
				t.Fatalf("Expected value: %d, instead got: %s", ranking.PointsLost, record[6])
			}
			if record[7] != strconv.FormatInt(ranking.PointsEarned-ranking.PointsLost, 10) {
				t.Fatalf("Expected value: %d, instead got: %s", ranking.PointsEarned-ranking.PointsLost, record[7])
			}
			var expectedEffectiveness string
			if ranking.TotalMatches > 0 {
				expectedEffectiveness = strconv.FormatFloat(float64(ranking.Victories)/float64(ranking.TotalMatches), 'f', 2, 64)
			} else {
				expectedEffectiveness = "0.00"
			}
			if record[8] != expectedEffectiveness {
				t.Fatalf("Expected value: %s, instead got: %s", expectedEffectiveness, record[8])
			}
		}
	})

	t.Run("LoadRankings", func(t *testing.T) {
		// prepare test rankings
		mario := model.Player{Name: "Mario"}
		luigi := model.Player{Name: "Luigi"}
		wario := model.Player{Name: "Wario"}
		waluigi := model.Player{Name: "Waluigi"}
		peach := model.Player{Name: "Peach"}
		daisy := model.Player{Name: "Daisy"}
		marioRanking := &model.PlayerRanking{Player: &mario, TotalMatches: 4, Victories: 2, PointsEarned: 676, PointsLost: 630}
		luigiRanking := &model.PlayerRanking{Player: &luigi, TotalMatches: 4, Victories: 2, PointsEarned: 676, PointsLost: 630}
		warioRanking := &model.PlayerRanking{Player: &wario, TotalMatches: 4, Victories: 1, PointsEarned: 562, PointsLost: 716}
		waluigiRanking := &model.PlayerRanking{Player: &waluigi, TotalMatches: 4, Victories: 1, PointsEarned: 562, PointsLost: 716}
		peachRanking := &model.PlayerRanking{Player: &peach, TotalMatches: 4, Victories: 3, PointsEarned: 716, PointsLost: 608}
		daisyRanking := &model.PlayerRanking{Player: &daisy, TotalMatches: 4, Victories: 3, PointsEarned: 716, PointsLost: 608}
		rankings := []*model.PlayerRanking{daisyRanking, peachRanking, luigiRanking, marioRanking, waluigiRanking, warioRanking}
		// test
		var rankingService = RankingService{
			playerService: &PlayerService{db: db},
			matchService:  &MatchService{db: db},
		}
		loadedRankings := rankingService.LoadRankings()
		var rankingsAreEquals = func(a *model.PlayerRanking, b *model.PlayerRanking) bool {
			return a.Player.Name == b.Player.Name && a.PointsEarned == b.PointsEarned && a.PointsLost == b.PointsLost && a.TotalMatches == b.TotalMatches && a.Victories == b.Victories
		}
		for _, ranking := range rankings {
			var found = false
			for _, loadedRanking := range loadedRankings {
				if rankingsAreEquals(ranking, loadedRanking) {
					found = true
					break
				}
			}
			if !found {
				t.Fatalf("Could not find ranking for player %s", ranking.Player.Name)
			}
		}

	})

	t.Run("TestSaveRankingsCSV", func(t *testing.T) {
		pathToFile := t.TempDir() + "/test-rankings.csv"
		var rankingService = RankingService{
			playerService: &PlayerService{db: db},
			matchService:  &MatchService{db: db},
		}

		if err := rankingService.SaveRankingsCSV(pathToFile); err != nil {
			t.Fatal(err)
		}

		resultContent, err := os.ReadFile(pathToFile)
		if err != nil {
			t.Fatal(err)
		}
		expectedContent, err := os.ReadFile("./test_ranking_data.csv")
		if err != nil {
			t.Fatal(err)
		}
		for i, currentByte := range resultContent {
			if currentByte != expectedContent[i] {
				t.Logf("%c expected, but got %c", expectedContent[i], currentByte)
				t.Fatalf("%s\n\n%s", expectedContent, resultContent)
			}
		}
	})
}
