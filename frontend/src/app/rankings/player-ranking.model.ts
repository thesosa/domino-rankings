import { model } from '../../../wailsjs/go/models';

export type PlayerRanking = {
  player: model.Player;
  totalMatches: number;
  victories: number;
  pointsEarned: number;
  pointsLost: number;
};
