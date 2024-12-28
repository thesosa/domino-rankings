import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { SaveFileDialogCSV } from '../../../wailsjs/go/main/App';
import { model } from '../../../wailsjs/go/models';
import { LoadMatches } from '../../../wailsjs/go/service/MatchService';
import { LoadPlayers } from '../../../wailsjs/go/service/PlayerService';
import { SaveRankingsCSV } from '../../../wailsjs/go/service/RankingService';
import { PlayerRanking } from './player-ranking.model';

@Component({
  selector: 'app-rankings',
  templateUrl: 'rankings.component.html',
})
export class RankingsComponent implements OnInit {
  matches: model.Match[] = [];
  players: model.Player[] = [];
  rankings: PlayerRanking[] = [];

  constructor(private toastr: ToastrService) {}

  async ngOnInit(): Promise<void> {
    this.players = await LoadPlayers();
    this.matches = await LoadMatches();
    this.rankings = this.players.map((player) => {
      const ranking = {
        player,
        totalMatches: 0,
        victories: 0,
        pointsEarned: 0,
        pointsLost: 0,
      };
      return ranking;
    });

    // fill rankings data
    this.matches.forEach((match) => {
      // first, extract the relevant ranking objects
      const playerA1Rank = this.rankings.find(
        (ranking) => ranking.player.Name === match.TeamA.Player1.Name
      );
      const playerA2Rank = this.rankings.find(
        (ranking) => ranking.player.Name === match.TeamA.Player2.Name
      );
      const playerB1Rank = this.rankings.find(
        (ranking) => ranking.player.Name === match.TeamB.Player1.Name
      );
      const playerB2Rank = this.rankings.find(
        (ranking) => ranking.player.Name === match.TeamB.Player2.Name
      );

      // figure out which team won
      const teamAWon = match.TeamAPoints === 200;
      // assign points and increased match count for each player
      if (teamAWon) {
        // team A
        playerA1Rank!.totalMatches++;
        playerA2Rank!.totalMatches++;
        playerA1Rank!.victories++;
        playerA2Rank!.victories++;
        playerA1Rank!.pointsEarned += match.TeamAPoints;
        playerA2Rank!.pointsEarned += match.TeamAPoints;
        playerA1Rank!.pointsLost += match.TeamBPoints;
        playerA2Rank!.pointsLost += match.TeamBPoints;

        // team B
        playerB1Rank!.totalMatches++;
        playerB2Rank!.totalMatches++;
        playerB1Rank!.pointsEarned += match.TeamBPoints;
        playerB2Rank!.pointsEarned += match.TeamBPoints;
        playerB1Rank!.pointsLost += match.TeamAPoints;
        playerB2Rank!.pointsLost += match.TeamAPoints;
      } else {
        // team A
        playerA1Rank!.totalMatches++;
        playerA2Rank!.totalMatches++;
        playerA1Rank!.pointsEarned += match.TeamAPoints;
        playerA2Rank!.pointsEarned += match.TeamAPoints;
        playerA1Rank!.pointsLost += match.TeamBPoints;
        playerA2Rank!.pointsLost += match.TeamBPoints;

        // team B
        playerB1Rank!.totalMatches++;
        playerB2Rank!.totalMatches++;
        playerB1Rank!.victories++;
        playerB2Rank!.victories++;
        playerB1Rank!.pointsEarned += match.TeamBPoints;
        playerB2Rank!.pointsEarned += match.TeamBPoints;
        playerB1Rank!.pointsLost += match.TeamAPoints;
        playerB2Rank!.pointsLost += match.TeamAPoints;
      }
    });

    // sort rankings
    this.rankings.sort((a, b) => {
      const victoriesDiff = b.victories - a.victories;
      if (victoriesDiff === 0) {
        const matchesDiff = b.totalMatches - a.totalMatches;
        if (matchesDiff === 0) {
          return (
            b.pointsEarned - b.pointsLost - (a.pointsEarned - a.pointsLost)
          );
        }
        return matchesDiff;
      }
      return victoriesDiff;
    });
  }

  async exportCSV(): Promise<void> {
    const fileName = await SaveFileDialogCSV();
    if (fileName.length === 0) {
      // user canceled
      return;
    }
    SaveRankingsCSV(fileName);
  }

  exportPDF(): void {
    // TODO implement this method
    this.toastr.warning('Funcionalidad no disponible en esta versión.');
  }

  back(): void {
    window.history.back();
  }
}
