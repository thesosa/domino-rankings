import { DatePipe } from '@angular/common';
import {
  ComponentFixture,
  fakeAsync,
  flush,
  TestBed,
  tick,
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {
  FaIconLibrary,
  FontAwesomeModule,
} from '@fortawesome/angular-fontawesome';
import {
  faBomb,
  faPlus,
  faSearch,
  faTimes,
  faTrashAlt,
} from '@fortawesome/free-solid-svg-icons';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { model } from '../../../wailsjs/go/models';
import * as matchService from '../../../wailsjs/go/service/MatchService';
import { MatchListComponent } from './match-list.component';

describe('MatchListComponent', () => {
  let fixture: ComponentFixture<MatchListComponent>;
  let component: MatchListComponent;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      declarations: [MatchListComponent],
      imports: [
        FontAwesomeModule,
        NoopAnimationsModule,
        ToastrModule.forRoot(),
      ],
      providers: [DatePipe],
    }).compileComponents();
    fixture = TestBed.createComponent(MatchListComponent);
    component = fixture.componentInstance;
    const iconLibrary = TestBed.inject(FaIconLibrary);
    iconLibrary.addIcons(faBomb, faPlus, faSearch, faTimes, faTrashAlt);
  });

  beforeAll(() => {
    HTMLDialogElement.prototype.show = jest.fn();
    HTMLDialogElement.prototype.showModal = jest.fn();
    HTMLDialogElement.prototype.close = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it('should render title', () => {
    const title: HTMLHeadingElement = fixture.debugElement.query(
      By.css('h1')
    ).nativeElement;
    expect(title.textContent).toBe('Partidas');
  });

  it('should render subtitle', () => {
    const subtitle: HTMLHeadingElement = fixture.debugElement.query(
      By.css('p.subtitle')
    ).nativeElement;
    expect(subtitle.textContent).toContain(
      'La lista de todas las partidas ordenadas por fecha desde la más reciente.'
    );
  });

  it('should present message in empty table', () => {
    jest.spyOn(matchService, 'LoadMatches').mockResolvedValue([]);
    fixture.detectChanges();
    const table: HTMLTableElement = fixture.debugElement.query(
      By.css('table')
    ).nativeElement;
    expect(table.tBodies.item(0)?.rows).toHaveLength(1);
    expect(table.tBodies.item(0)?.rows.item(0)?.textContent).toBe(
      'No hay partidas para mostrar.'
    );
  });

  it('should move the user to rankings screen', () => {
    const rankingsLink = fixture.debugElement.query(
      By.css('a[routerLink="rankings"]')
    );
    expect(rankingsLink).toBeTruthy();
  });

  it('should move the user to match form screen', () => {
    const newMatchButton = fixture.debugElement.query(
      By.css('div.fab-container > button[type="button"].button.is-primary')
    );
    expect(newMatchButton).toBeTruthy();
    expect(newMatchButton.attributes['routerLink']).toBe('/matches/new');
    expect(newMatchButton.attributes['aria-label']).toBe('Agregar partida');
  });

  it('should show an error toastr message when failing to load matches', fakeAsync(() => {
    const toastr = TestBed.inject(ToastrService);
    jest.spyOn(toastr, 'error');
    jest.spyOn(matchService, 'LoadMatches').mockRejectedValue({});
    fixture.detectChanges();
    tick();
    expect(toastr.error).toHaveBeenCalledWith(
      'Ocurrió un error cargando la lista de partidas.'
    );
    expect(component.matches).toHaveLength(0);
    expect(component.matchesToShow).toHaveLength(0);
    flush();
  }));

  it('should open confirmation dialog to delete all data', fakeAsync(() => {
    jest.spyOn(matchService, 'LoadMatches').mockResolvedValue([]);
    fixture.detectChanges();
    tick();
    jest.spyOn(component.confirmNukeDialog.nativeElement, 'showModal');
    component.showConfirmNukeDialog();
    expect(
      component.confirmNukeDialog.nativeElement.showModal
    ).toHaveBeenCalled();
  }));

  it('should hide nuke data button when empty', fakeAsync(() => {
    jest.spyOn(matchService, 'LoadMatches').mockResolvedValue([]);
    fixture.autoDetectChanges();
    tick();
    const nukeButton = fixture.debugElement.query(
      By.css('th > button.button.is-danger')
    );
    expect(nukeButton).toBeNull();
  }));

  describe('With matches', () => {
    let matches: model.Match[];

    const createMatches: () => model.Match[] = () => {
      const mario = new model.Player({ ID: 1, Name: 'Mario' });
      const luigi = new model.Player({ ID: 2, Name: 'Luigi' });
      const peach = new model.Player({ ID: 3, Name: 'Peach' });
      const daisy = new model.Player({ ID: 4, Name: 'Daisy' });
      const wario = new model.Player({ ID: 5, Name: 'Wario' });
      const waluigi = new model.Player({ ID: 6, Name: 'Waluigi' });
      const team1 = new model.Team({ Player1: mario, Player2: luigi });
      const team2 = new model.Team({ Player1: peach, Player2: daisy });
      const team3 = new model.Team({ Player1: wario, Player2: waluigi });

      return [
        new model.Match({
          ID: 1,
          MatchDate: '2024-12-27',
          TeamA: team1,
          TeamB: team2,
          TeamAPoints: 180,
          TeamBPoints: 200,
        }),
        new model.Match({
          ID: 2,
          MatchDate: '2024-12-26',
          TeamA: team3,
          TeamB: team2,
          TeamAPoints: 132,
          TeamBPoints: 200,
        }),
        new model.Match({
          ID: 3,
          MatchDate: '2024-12-24',
          TeamA: team1,
          TeamB: team3,
          TeamAPoints: 200,
          TeamBPoints: 120,
        }),
        new model.Match({
          ID: 4,
          MatchDate: '2024-12-23',
          TeamA: team3,
          TeamB: team2,
          TeamAPoints: 200,
          TeamBPoints: 116,
        }),
        new model.Match({
          ID: 5,
          MatchDate: '2024-12-21',
          TeamA: team1,
          TeamB: team2,
          TeamAPoints: 95,
          TeamBPoints: 200,
        }),
        new model.Match({
          ID: 6,
          MatchDate: '2024-12-20',
          TeamA: team1,
          TeamB: team3,
          TeamAPoints: 200,
          TeamBPoints: 110,
        }),
      ];
    };

    beforeEach(() => {
      matches = createMatches();
      jest.spyOn(matchService, 'LoadMatches').mockResolvedValue(matches);
    });

    it('should filter matches to show', fakeAsync(() => {
      fixture.autoDetectChanges();
      tick();
      const searchQuery = 'Mario';
      let $event = { target: { value: searchQuery } };
      component.filterByPlayerName($event as any);
      expect(component.matchesToShow.length).toBeLessThan(
        component.matches.length
      );
      for (let match of component.matchesToShow) {
        const playerNames = [
          match.TeamA.Player1.Name,
          match.TeamA.Player2.Name,
          match.TeamB.Player1.Name,
          match.TeamB.Player2.Name,
        ];
        const included = playerNames.some((playerName) =>
          playerName.includes(searchQuery)
        );
        expect(included).toBe(true);
      }
    }));

    it('should load matches on init', fakeAsync(() => {
      component.ngOnInit();
      tick();
      expect(component.matches).toEqual(matches);
      expect(component.matchesToShow).toEqual(component.matches);
      expect(component.matchesToShow).not.toBe(component.matches);
    }));

    it('should show matches in table', fakeAsync(() => {
      const datePipe = TestBed.inject(DatePipe);
      fixture.autoDetectChanges();
      tick();
      const table: HTMLTableElement = fixture.debugElement.query(
        By.css('table')
      ).nativeElement;
      expect(table.tBodies.item(0)?.rows).toHaveLength(matches.length);
      const tBody = table.tBodies.item(0)!;
      for (let i = 0; i < tBody.rows.length; i++) {
        const row = tBody.rows.item(i)!;
        const matchDate = row.cells.item(0)?.textContent;
        const playerA1 = row.cells.item(1)?.textContent;
        const playerA2 = row.cells.item(2)?.textContent;
        const teamAPoints = row.cells.item(3)?.textContent;
        const playerB1 = row.cells.item(4)?.textContent;
        const playerB2 = row.cells.item(5)?.textContent;
        const teamBPoints = row.cells.item(6)?.textContent;

        const match = matches[i];
        expect(datePipe.transform(match.MatchDate)).toEqual(matchDate);
        expect(match.TeamA.Player1.Name).toEqual(playerA1);
        expect(match.TeamA.Player2.Name).toEqual(playerA2);
        expect(match.TeamAPoints.toString()).toEqual(teamAPoints);
        expect(match.TeamB.Player1.Name).toEqual(playerB1);
        expect(match.TeamB.Player2.Name).toEqual(playerB2);
        expect(match.TeamBPoints.toString()).toEqual(teamBPoints);
      }
    }));

    it('should call show nuke confirmation dialog on click', fakeAsync(() => {
      jest.spyOn(component, 'showConfirmNukeDialog');
      fixture.autoDetectChanges();
      tick();
      const nukeButton: HTMLButtonElement = fixture.debugElement.query(
        By.css('th > button.button.is-danger')
      ).nativeElement;
      nukeButton.click();
      expect(component.showConfirmNukeDialog).toHaveBeenCalled();
    }));

    it('should call nukeData on click', fakeAsync(() => {
      jest.spyOn(matchService, 'DeleteAllMatches').mockResolvedValue();
      jest.spyOn(component, 'nukeData');
      fixture.autoDetectChanges();
      tick();
      const nukeButton: HTMLButtonElement = fixture.debugElement.query(
        By.css('#nuke-button')
      ).nativeElement;
      nukeButton.click();
      expect(component.nukeData).toHaveBeenCalled();
    }));

    it('should delete all data', fakeAsync(() => {
      jest.spyOn(matchService, 'DeleteAllMatches').mockResolvedValue();
      fixture.detectChanges();
      tick();
      jest.spyOn(component.confirmNukeDialog.nativeElement, 'close');
      expect(component.matches).toEqual(matches);
      expect(component.matchesToShow).toEqual(matches);
      component.nukeData();
      tick();
      expect(matchService.DeleteAllMatches).toHaveBeenCalled();
      expect(component.matches).toHaveLength(0);
      expect(component.matchesToShow).toHaveLength(0);
      expect(
        component.confirmNukeDialog.nativeElement.close
      ).toHaveBeenCalled();
    }));

    it('should open confirmation dialog to delete data row', fakeAsync(() => {
      fixture.autoDetectChanges();
      tick();
      jest.spyOn(component.confirmationDialog.nativeElement, 'showModal');
      const deleteButtons = fixture.debugElement.queryAll(
        By.css('td > button.button.is-danger')
      );
      expect(deleteButtons).toHaveLength(matches.length);
      for (let i = 0; i < matches.length; i++) {
        const button = deleteButtons[i];
        const match = matches[i];
        button.nativeElement.click();
        expect(
          component.confirmationDialog.nativeElement.showModal
        ).toHaveBeenCalledTimes(i + 1);
        expect(component.matchToDelete).toBe(match);
      }
    }));

    it('should delete match', fakeAsync(async () => {
      const originalMatches = createMatches();
      const matches = [...originalMatches];
      jest.spyOn(matchService, 'LoadMatches').mockResolvedValue(matches);
      jest.spyOn(matchService, 'DeleteMatch').mockResolvedValue();
      fixture.autoDetectChanges();
      tick();
      jest.spyOn(component.confirmationDialog.nativeElement, 'close');
      for (let i = 0; i < originalMatches.length; i++) {
        const match = originalMatches[i];
        const index = matches.indexOf(match);
        matches.splice(index, 1);
        component.matchToDelete = match;
        await component.confirmDelete();
        expect(matchService.DeleteMatch).toHaveBeenCalledWith(match.ID);
        expect(component.matchToDelete).toBeUndefined();
        expect(component.matchesToShow).not.toContain(match);
      }
    }));

    it('should call confirmDelete on click', fakeAsync(() => {
      jest.spyOn(component, 'confirmDelete').mockReturnValue(Promise.resolve());
      fixture.autoDetectChanges();
      tick();
      const confirmDeleteButton: HTMLButtonElement = fixture.debugElement.query(
        By.css('#confirm-delete-button')
      ).nativeElement;
      component.matchToDelete = matches[0];
      confirmDeleteButton.click();
      expect(component.confirmDelete).toHaveBeenCalled();
    }));
  });
});
