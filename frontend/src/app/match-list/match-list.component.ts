import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { model } from '../../../wailsjs/go/models';
import {
  DeleteAllMatches,
  DeleteMatch,
  LoadMatches,
} from '../../../wailsjs/go/service/MatchService';

@Component({
  selector: 'app-match-list',
  templateUrl: 'match-list.component.html',
  styleUrls: ['match-list.component.scss'],
})
export class MatchListComponent implements OnInit {
  matches: model.Match[] = [];
  matchesToShow: model.Match[] = [];
  matchToDelete?: model.Match;
  @ViewChild('deleteConfirmationDialog')
  confirmationDialog!: ElementRef<HTMLDialogElement>;
  @ViewChild('confirmNukeDialog')
  confirmNukeDialog!: ElementRef<HTMLDialogElement>;

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
      return playerNames.some((playerName) => playerName.includes(searchQuery));
    });
  }

  showConfirmationDialog(item: model.Match): void {
    this.matchToDelete = item;
    this.confirmationDialog.nativeElement.showModal();
  }

  async confirmDelete(): Promise<void> {
    try {
      await DeleteMatch(this.matchToDelete!.ID!);
      this.toastr.success('Partida eliminada.');
      this.confirmationDialog.nativeElement.close();
      const index = this.matchesToShow.findIndex(
        (match) => this.matchToDelete?.ID === match.ID
      );
      this.matchesToShow.splice(index, 1);
      delete this.matchToDelete;
      try {
        this.matches = await LoadMatches();
      } catch {
        this.toastr.error('Ocurrió un error cargando la lista de partidas.');
      }
    } catch {
      this.toastr.error('Ocurrió un error eliminado la partida.');
    }
  }

  cancelDelete(): void {
    this.confirmationDialog.nativeElement.close();
    delete this.matchToDelete;
  }

  showConfirmNukeDialog(): void {
    this.confirmNukeDialog.nativeElement.showModal();
  }

  nukeData(): void {
    DeleteAllMatches()
      .then(() => {
        this.matches = [];
        this.matchesToShow = [];
      })
      .catch(() => {
        this.toastr.error('Ocurrió un error tratando de eliminar la data.');
      });
    this.confirmNukeDialog.nativeElement.close();
  }

  cancelNuke(): void {
    this.confirmNukeDialog.nativeElement.close();
  }
}
