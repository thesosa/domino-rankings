package service

import (
	"database/sql"
	"fmt"
	"os"
	"runtime"
	"testing"
)

func TestMain(m *testing.M) {
	// os.Exit skips defer calls
	// so we need to call another function
	code, err := run(m)
	if err != nil {
		fmt.Println(err)
	}
	os.Exit(code)
}

func run(m *testing.M) (code int, err error) {
	db, err = sql.Open("sqlite3", "file:../test.db?cache=shared")
	if err != nil {
		return -1, fmt.Errorf("could not connect to database: %w", err)
	}
	defer db.Close()

	// truncates all test data after the tests are run
	var truncateData = func() {
		for _, t := range []string{"player", "match"} {
			_, _ = db.Exec(fmt.Sprintf("DELETE FROM %s", t))
		}
	}
	defer truncateData()

	err = createPlayerTable(db)
	if err != nil {
		return -1, fmt.Errorf("could not create player table: %w", err)
	}
	err = createMatchTable(db)
	if err != nil {
		return -1, fmt.Errorf("could not create match table: %w", err)
	}
	// make sure we start with clean tables
	truncateData()

	return m.Run(), nil
}

func TestDBPathInWindows(t *testing.T) {
	if runtime.GOOS != "windows" {
		t.SkipNow()
	}
	var userCacheDir, err = os.UserCacheDir()
	if err != nil {
		t.Fatal(err)
	}
	var expectedPath = userCacheDir + "\\domino-ranks\\domino-data.db"
	var actualPath = DBPath()
	if expectedPath != actualPath {
		t.Fail()
	}
}

func TestDBPathNotWindows(t *testing.T) {
	if runtime.GOOS == "windows" {
		t.SkipNow()
	}
	var expectedPath = "./domino-data.db"
	var actualPath = DBPath()
	if expectedPath != actualPath {
		t.Fatalf("expected db path to be: %s instead it was %s", expectedPath, actualPath)
	}
}
