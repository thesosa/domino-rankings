import { Component, OnInit } from '@angular/core';
import { model } from '../../../wailsjs/go/models';
import {
  DeleteMatch,
  LoadMatches,
} from '../../../wailsjs/go/service/MatchService';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-match-list',
  templateUrl: 'match-list.component.html',
})
export class MatchListComponent implements OnInit {
  matches: model.Match[] = [];
  matchesToShow: model.Match[] = [];
  matchToDelete?: model.Match;
  openConfirmationDialog = false;

  constructor(private toastr: ToastrService) {}

  ngOnInit(): void {
    LoadMatches()
      .then((result) => {
        this.matches = result;
        this.matchesToShow = [...result];
      })
      .catch(() => {
        this.toastr.error('Ocurrió un error cargando la lista de partidas.');
      });
  }

  filterByPlayerName($event: KeyboardEvent): void {
    const searchQuery = ($event.target as HTMLInputElement).value;
    this.matchesToShow = this.matches.filter((match) => {
      const playerNames = [
        match.TeamA.Player1.Name,
        match.TeamA.Player2.Name,
        match.TeamB.Player1.Name,
        match.TeamB.Player2.Name,
      ];
      return playerNames.some((player) => player.includes(searchQuery));
    });
  }

  showConfirmationDialog(item: model.Match): void {
    this.matchToDelete = item;
    this.openConfirmationDialog = true;
  }

  confirmDelete(): void {
    DeleteMatch(this.matchToDelete!.ID!)
      .then(() => {
        this.toastr.success('Partida eliminada.');
        this.openConfirmationDialog = false;
        delete this.matchToDelete;
        LoadMatches()
          .then((result) => (this.matches = result))
          .catch(() => {
            this.toastr.error(
              'Ocurrió un error cargando la lista de partidas.'
            );
          });
      })
      .catch(() => {
        this.toastr.error('Ocurrió un error eliminado la partida.');
      });
  }

  cancelDelete(): void {
    this.openConfirmationDialog = false;
    delete this.matchToDelete;
  }
}
