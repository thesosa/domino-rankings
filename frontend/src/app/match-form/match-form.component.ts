import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-match-form',
  templateUrl: 'match-form.component.html',
  styleUrls: ['./match-form.component.scss'],
})
export class MatchFormComponent implements OnInit {
  players: string[] = [
    'Juan Victor',
    'David',
    'Alejandro',
    'Samuel',
    'Benito',
    'Carlos',
    'Alexander',
    'Alberto',
  ];
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
  }

  cancel(): void {
    this.router.navigate(['']);
  }

  save(): void {
    this.toastr.warning('Feature pending');
  }
}
