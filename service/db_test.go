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
	// pseudo-code, some implementation excluded:
	//
	// 1. create test.db if it does not exist
	// 2. run our DDL statements to create the required tables if they do not exist
	// 3. run our tests
	// 4. truncate the test db tables

	db, err = sql.Open("sqlite3", "file:../test.db?cache=shared")
	if err != nil {
		return -1, fmt.Errorf("could not connect to database: %w", err)
	}

	// truncates all test data after the tests are run
	defer func() {
		for _, t := range []string{"player", "match"} {
			_, _ = db.Exec(fmt.Sprintf("DELETE FROM %s", t))
		}
		db.Close()
	}()

	err = createPlayerTable(db)
	if err != nil {
		return -1, fmt.Errorf("could not create player table: %w", err)
	}
	err = createMatchTable(db)
	if err != nil {
		return -1, fmt.Errorf("could not create match table: %w", err)
	}

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
