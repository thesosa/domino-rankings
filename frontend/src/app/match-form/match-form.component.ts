import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
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

  async ngOnInit(): Promise<void> {
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
    const noDuplicatePlayers = (
      form: AbstractControl
    ): ValidationErrors | null => {
      const player1: string = form.get('player1')!.value;
      const player2: string = form.get('player2')!.value;
      const player3: string = form.get('player3')!.value;
      const player4: string = form.get('player4')!.value;
      const playerNames = [player1, player2, player3, player4].filter(
        (name) => name.trim().length > 0
      );
      const hasDuplicates = new Set(playerNames).size !== playerNames.length;
      if (hasDuplicates) {
        return { duplicatePlayers: true };
      }
      return null;
    };
    this.matchForm.addValidators(noDuplicatePlayers);
    try {
      const players = await LoadPlayers();
      this.players = players.map((player) => player.Name);
    } catch (error) {
      this.toastr.warning('Ocurrió un error cargando la lista de jugadores.');
    }
  }

  cancel(): void {
    this.router.navigate(['']);
  }

  async save(): Promise<void> {
    if (this.matchForm.invalid) {
      return;
    }
    const matchDate: Date = new Date(this.matchForm.get('matchDate')!.value);
    const player1: string = this.matchForm.get('player1')!.value;
    const player2: string = this.matchForm.get('player2')!.value;
    const player3: string = this.matchForm.get('player3')!.value;
    const player4: string = this.matchForm.get('player4')!.value;
    const teamAPoints: number = this.matchForm.get('teamAPoints')!.value;
    const teamBPoints: number = this.matchForm.get('teamBPoints')!.value;
    // make sure at least one team has 200 points
    if (teamAPoints !== 200 && teamBPoints !== 200) {
      this.toastr.warning('El equipo ganador debe tener 200 puntos.');
      return;
    }
    // make sure ONLY ONE team has 200 points
    if (teamAPoints === teamBPoints) {
      this.toastr.warning('Sólo puede haber un equipo ganador.');
      return;
    }

    // save new players
    const playerNames = [player1, player2, player3, player4];
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

    try {
      await SaveMatch(match);
      this.router.navigate(['']);
    } catch (error) {
      this.toastr.error('Ocurrió un error al intentar guardar la partida.');
    }
  }
}
