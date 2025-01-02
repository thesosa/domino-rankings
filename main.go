package main

import (
	"domino-ranks/service"
	"embed"
	"log"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"github.com/wailsapp/wails/v2/pkg/options/mac"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	// Create an instance of the app structure
	app := NewApp()

	// Init database
	log.Println()
	dbPath := service.DBPath()
	db, err := service.InitDB(dbPath)
	if err != nil {
		log.Fatal(err)
	}
	playerService := service.NewPlayerService(db)
	matchService := service.NewMatchService(db)
	rankingService := service.NewRankingService(playerService, matchService)
	log.Println("Initialized DB. Running wails.")
	defer db.Close()

	// Create application with options
	err = wails.Run(&options.App{
		Title:  "Domino Rankings",
		Width:  1200,
		Height: 840,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: &options.RGBA{R: 27, G: 38, B: 54, A: 1},
		OnStartup:        app.startup,
		Bind: []interface{}{
			app,
			playerService,
			matchService,
			rankingService,
		},
		Mac: &mac.Options{
			About: &mac.AboutInfo{
				Title: "Domino Rankings",
				Message: `Aplicación para llevar conteo, datos, y clasificatorias de partidas de Dominó.

				© 2025 David Sosa david.sosa@peopleware.com`,
			},
		},
	})

	if err != nil {
		log.Fatalf("Error: %v", err)
	}
}
