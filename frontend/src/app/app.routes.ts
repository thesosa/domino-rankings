import { Routes } from '@angular/router';
import { MatchFormComponent } from './match-form/match-form.component';
import { MatchListComponent } from './match-list/match-list.component';
import { RankingsComponent } from './rankings/rankings.component';

export const routes: Routes = [
  {
    path: '',
    component: MatchListComponent,
  },
  {
    path: 'matches/new',
    component: MatchFormComponent,
  },
  {
    path: 'rankings',
    component: RankingsComponent,
  },
];
