# Domino ranks app

This is an application that can be used to log dominoes matches and show all player's rankings.
The main user for this app is my dad, who loves playing dominoes and started logging data from his local colmado matches.

## Rules of Latin American version of Dominoes

The stock is divided equally among all players, each having seven tiles in hand.
Players sitting on opposite ends of the table are part of the same team.
The game ends when one of the players has no tiles left or when the game is blocked.
In the first case, the team of the player without any tiles left earns the sum of the points left in the other player's hands.
When the game is blocked, the player with the least points in its hands between the blocking player and the next player earns the points left in all players' hands.
If both teams have the same points, the team that started wins the round.

## Data structures

Players, who are the people involved in dominoes matches, will have only an ID and a unique name:

| Field name | Type                          | Description                              |
| ---------- | ----------------------------- | ---------------------------------------- |
| `id`       | INT PRIMARY KEY AUTOINCREMENT | A unique ID, for normalization purposes. |
| `name`     | TEXT UNIQUE NOT NULL          | The name of the player.                  |

Teams are not saved in the database, since they can change from one match to another.

We need to divide matches by seasons, which can be for a single tournament or a number of tournaments.
Any match falling between the start and the end date of a season belongs to that season.
Maybe there should be a way to get the rankings of players for a single season, or for a number of seasons.

Seasons will have the following data fields:

| Field name   | Type                          | Description                      |
| ------------ | ----------------------------- | -------------------------------- |
| `id`         | INT PRIMARY KEY AUTOINCREMENT | A unique ID.                     |
| `start_date` | DATE NOT NULL                 | The starting date of the season. |
| `end_date`   | DATE NOT NULL                 | The final date of the season.    |

Matches have the following data fields:

| Field name    | Type   | Description                                                 |
| ------------- | ------ | ----------------------------------------------------------- |
| `match_date`  | date   | When the match occured.                                     |
| `player1`     | number | A reference to the first player of team A.                  |
| `player2`     | number | A reference to the second player of team A.                 |
| `player3`     | number | A reference to the first player of team B.                  |
| `player4`     | number | A reference to the second player of team B.                 |
| `teamA_score` | number | The amount of points team A (player 1 and player 2) scored. |
| `teamB_score` | number | The amount of points team B (player 3 and player 4) scored. |

## Data export

For the two major screens with data shown in a table (matches and rankings) there must be a button to export the data in CSV format.

## Screens

The starting screen for the application will be the [Match List screen](#match-list-screen), where a list of matches for a season will be shown. The list of screens and its navigation map must be as follows:

- Match list screen
  - New match screen
  - Rankings screen

Each but the home screen (match list screen) must contain a button to go back one step in the visual hierarchy.

### Match list screen

This screen's main component will be a table showing all matches data, one match per row.
Each row will have the following columns, in this particular order:

| Día de la partida | Jugador 1 | Jugador 2 | Puntos | Jugador 1 | Jugador 2 | Puntos |     |
| ----------------- | --------- | --------- | ------ | --------- | --------- | ------ | --- |
| Dev 17, 2024      | Manolo    | Milton    | 200    | Morty     | Mario     | 110    | DEL |

The data should be sorted by date, descending.

The delete button on the last column, when clicked, will show a confirmation dialog, asking the user to confirm they want to delete the selected match. If the user confirms, the match is deleted, removed from the table, and the dialog is closed. If not, the dialog closes and nothing else happens.
Above the columns for players and points, there should be a cell showing the team for those players and the scores. This cell should span 3 columns, 1 for each player and one for the points.

An input field must be located above the table, where the user can write the name of any player, and the application shall filter the matches shown in the table to only show those where any of the name of the players involved in the match contain the string written by the user. The search must happen on key up.
There must also be a floating action button that moves the user to the [New match screen](#new-match-screen).

There must also be a select component to select the season.
A button right next to this component can open a dialog to create a new season.
The dialog should only need a couple of date fields and two buttons, one to confirm and the other to cancel.
Pretty self-explanatory what these two buttons should do.

### New match screen

This screen holds the form to input match data.
An input field of type `date` for the match date.
For each team, 3 input fields. Two of them for player names, with an autocompleate feature.
The third input must be of type number, for the team's score.
Then, a couple of buttons, one to confirm, and one to cancel.

### Rankings screen

Show a list of all players with all the data from the matches of a selected season.
Seasons must have a minimum number of matches for a player to be ranked by effectiveness.
Players with more matches than the minimum matches for ranking must be at the top of the list.
Those top players must be sorted by effectiveness.
