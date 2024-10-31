package main

import (
	"domino-ranks/service"
	"embed"

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
	playerService := &service.PlayerService{}
	matchService := &service.MatchService{}

	// Init database
	InitDB()

	// Create application with options
	err := wails.Run(&options.App{
		Title:  "domino-stats",
		Width:  1024,
		Height: 768,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: &options.RGBA{R: 27, G: 38, B: 54, A: 1},
		OnStartup:        app.startup,
		Bind: []interface{}{
			app,
			playerService,
			matchService,
		},
		Mac: &mac.Options{
			About: &mac.AboutInfo{
				Title: "Domino Rankings",
				Message: `Aplicación para llevar conteo, datos, y clasificatorias de partidas de Dominó.

				© 2024 David Sosa david.sosa@peopleware.com`,
			},
		},
	})

	if err != nil {
		println("Error:", err.Error())
	}
}
