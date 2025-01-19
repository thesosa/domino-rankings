import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { SaveFileDialogCSV } from '../../../wailsjs/go/main/App';
import { model } from '../../../wailsjs/go/models';
import { LoadMatches } from '../../../wailsjs/go/service/MatchService';
import {
  DeletePlayer,
  LoadPlayers,
} from '../../../wailsjs/go/service/PlayerService';
import { SaveRankingsCSV } from '../../../wailsjs/go/service/RankingService';
import { PlayerRanking } from './player-ranking.model';

@Component({
  selector: 'app-rankings',
  templateUrl: 'rankings.component.html',
  styleUrls: ['rankings.component.scss']
})
export class RankingsComponent implements OnInit {
  matches: model.Match[] = [];
  players: model.Player[] = [];
  rankings: PlayerRanking[] = [];
  /**
   * How many matches a player has to play to qualify for tournaments
   */
  qualifyingThreshold = 50;

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

    this.sortRankings();
  }

  sortRankings(): void {
    // split rankings into players with >=qualifyingThreshold matches and players with <qualifyingThreshold matches
    const notQualifying: PlayerRanking[] = [];
    const qualifying: PlayerRanking[] = [];
    for (const ranking of this.rankings) {
      if (ranking.totalMatches < this.qualifyingThreshold) {
        notQualifying.push(ranking);
      } else {
        qualifying.push(ranking);
      }
    }

    // sort qualifying players by effectiveness, then by matches, then by points
    qualifying.sort((a, b) => {
      const aEff = a.victories / a.totalMatches;
      const bEff = b.victories / b.totalMatches;
      const effDiff = bEff - aEff;
      if (effDiff === 0) {
        const matchesDiff = b.totalMatches - a.totalMatches;
        if (matchesDiff === 0) {
          const aNetPoints = a.pointsEarned - a.pointsLost;
          const bNetPoints = b.pointsEarned - b.pointsLost;
          return bNetPoints - aNetPoints;
        }
        return matchesDiff;
      }
      return effDiff;
    });

    // sort the rest of the players by victories, then matches, then points
    notQualifying.sort((a, b) => {
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

    //
    this.rankings = [...qualifying, ...notQualifying];
  }

  async exportCSV(): Promise<void> {
    const fileName = await SaveFileDialogCSV();
    if (fileName.length === 0) {
      // user canceled
      return;
    }
    SaveRankingsCSV(fileName);
  }

  async deletePlayer(ranking: PlayerRanking): Promise<void> {
    await DeletePlayer(ranking.player.ID!);
    const index = this.rankings.indexOf(ranking);
    this.rankings.splice(index, 1);
  }

  back(): void {
    window.history.back();
  }
}
