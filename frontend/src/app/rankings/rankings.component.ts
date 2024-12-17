import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-rankings',
  templateUrl: 'rankings.component.html',
})
export class RankingsComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}

  back(): void {
    window.history.back();
  }
}
