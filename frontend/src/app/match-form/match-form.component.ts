import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { model } from '../../../wailsjs/go/models';
import { SaveMatch } from '../../../wailsjs/go/service/MatchService';
import {
  LoadPlayers,
  SavePlayer,
} from '../../../wailsjs/go/service/PlayerService';

@Component({
  selector: 'app-match-form',
  templateUrl: 'match-form.component.html',
  styleUrls: ['./match-form.component.scss'],
})
export class MatchFormComponent implements OnInit {
  maxDate = new Date().toISOString().split('T')[0];
  players: string[] = [];
  matchForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.matchForm = this.fb.group({
      matchDate: [
        new Date().toISOString().split('T')[0],
        [Validators.required],
      ],
      player1: ['', [Validators.required]],
      player2: ['', [Validators.required]],
      player3: ['', [Validators.required]],
      player4: ['', [Validators.required]],
      teamAPoints: [
        null,
        [Validators.required, Validators.min(0), Validators.max(200)],
      ],
      teamBPoints: [
        null,
        [Validators.required, Validators.min(0), Validators.max(200)],
      ],
    });
    LoadPlayers()
      .then((result) => (this.players = result.map((player) => player.Name)))
      .catch(() =>
        this.toastr.warning('Ocurrió un error cargando la lista de jugadores.')
      );
  }

  cancel(): void {
    this.router.navigate(['']);
  }

  save(): void {
    const player1: string = this.matchForm.get('player1')!.value;
    const player2: string = this.matchForm.get('player2')!.value;
    const player3: string = this.matchForm.get('player3')!.value;
    const player4: string = this.matchForm.get('player4')!.value;
    const playerNames = [player1, player2, player3, player4];
    const hasDuplicates = new Set(playerNames).size !== playerNames.length;
    if (hasDuplicates) {
      this.toastr.error('La partida no debe tener jugadores duplicados.');
      return;
    }
    const teamAPoints: number = this.matchForm.get('teamAPoints')!.value;
    const teamBPoints: number = this.matchForm.get('teamBPoints')!.value;
    const matchDate: Date = new Date(this.matchForm.get('matchDate')!.value);

    // save new players
    const newPlayers = playerNames.filter((p) => !this.players.includes(p!));
    newPlayers.forEach((player) => SavePlayer(player!));

    // build teams
    const teamA = new model.Team({
      Player1: new model.Player({ Name: player1 }),
      Player2: new model.Player({ Name: player2 }),
    });
    const teamB = new model.Team({
      Player1: new model.Player({ Name: player3 }),
      Player2: new model.Player({ Name: player4 }),
    });
    // build match
    const match = new model.Match({
      MatchDate: matchDate?.toISOString(),
      TeamA: teamA,
      TeamB: teamB,
      TeamAPoints: teamAPoints,
      TeamBPoints: teamBPoints,
    });

    SaveMatch(match)
      .then(() => {
        this.router.navigate(['']);
      })
      .catch(() => {
        this.toastr.error('Ocurrió un error al intentar guardar la partida.');
      });
  }
}
