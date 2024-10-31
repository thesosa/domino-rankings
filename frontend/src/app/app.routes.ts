import { Routes } from '@angular/router';
import { MatchFormComponent } from './match-form/match-form.component';
import { MatchListComponent } from './match-list/match-list.component';

export const routes: Routes = [
  {
    path: '',
    component: MatchListComponent,
  },
  {
    path: 'matches/new',
    component: MatchFormComponent,
  },
];
