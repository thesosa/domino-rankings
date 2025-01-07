import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import {
  FaIconLibrary,
  FontAwesomeModule,
} from '@fortawesome/angular-fontawesome';
import { faSave, faTimes } from '@fortawesome/free-solid-svg-icons';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { model } from '../../../wailsjs/go/models';
import * as matchService from '../../../wailsjs/go/service/MatchService';
import * as playerService from '../../../wailsjs/go/service/PlayerService';
import { AutocompleteComponent } from '../autocomplete/autocomplete.component';
import { MatchFormComponent } from './match-form.component';

describe('MatchFormComponent', () => {
  let component: MatchFormComponent;
  let fixture: ComponentFixture<MatchFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AutocompleteComponent, MatchFormComponent],
      imports: [FontAwesomeModule, ReactiveFormsModule, ToastrModule.forRoot()],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MatchFormComponent);
    component = fixture.componentInstance;
    const iconLibrary = TestBed.inject(FaIconLibrary);
    iconLibrary.addIcons(faSave, faTimes);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should render title', () => {
    const title = fixture.debugElement.query(By.css('h1'))
      .nativeElement as HTMLHeadingElement;
    expect(title.textContent).toContain('Nueva partida');
  });

  it('should render subtitle', () => {
    const title = fixture.debugElement.query(By.css('p.subtitle'))
      .nativeElement as HTMLParagraphElement;
    expect(title.textContent).toContain('Formulario para agregar una partida.');
  });

  it('should load players on init', async () => {
    const player1 = new model.Player({ ID: 1, Name: 'Player 1' });
    const player2 = new model.Player({ ID: 2, Name: 'Player 2' });
    jest
      .spyOn(playerService, 'LoadPlayers')
      .mockResolvedValue([player1, player2]);

    await component.ngOnInit();

    expect(component.players).toEqual([player1.Name, player2.Name]);
  });

  it('should not accept future dates', () => {
    jest.spyOn(playerService, 'LoadPlayers').mockResolvedValue([]);

    fixture.detectChanges();
    const dateField = fixture.debugElement.query(By.css('#matchDate'))
      .nativeElement as HTMLInputElement;
    const today = new Date().toISOString().split('T')[0];
    expect(dateField.max).toEqual(today);
  });

  it('should call "cancel" method when pressing the "cancel" button', () => {
    jest.spyOn(component, 'cancel');
    const cancelButton = fixture.debugElement.query(
      By.css('button[type=button]')
    );
    (cancelButton.nativeElement as HTMLButtonElement).click();
    expect(component.cancel).toHaveBeenCalled();
  });

  it('should re-route to home URL on cancel', () => {
    const router = TestBed.inject(Router);
    jest.spyOn(router, 'navigate');
    component.cancel();
    expect(router.navigate).toHaveBeenCalledWith(['']);
  });

  it('must not allow negative points', () => {
    jest.spyOn(playerService, 'LoadPlayers').mockResolvedValue([]);
    component.ngOnInit();
    const teamAPointsControl = component.matchForm.get('teamAPoints')!;
    const teamBPointsControl = component.matchForm.get('teamBPoints')!;
    teamAPointsControl.setValue(-1);
    expect(teamAPointsControl.valid).toBe(false);
    teamBPointsControl.setValue(-1);
    expect(teamBPointsControl.valid).toBe(false);
  });

  it('must not allow over 200 points', () => {
    jest.spyOn(playerService, 'LoadPlayers').mockResolvedValue([]);
    component.ngOnInit();
    const teamAPointsControl = component.matchForm.get('teamAPoints')!;
    const teamBPointsControl = component.matchForm.get('teamBPoints')!;
    teamAPointsControl.setValue(200);
    expect(teamAPointsControl.valid).toBe(true);
    teamAPointsControl.setValue(201);
    expect(teamAPointsControl.valid).toBe(false);
    teamBPointsControl.setValue(200);
    expect(teamBPointsControl.valid).toBe(true);
    teamBPointsControl.setValue(201);
    expect(teamBPointsControl.valid).toBe(false);
  });

  it('must not allow teams with negative points', () => {
    jest.spyOn(playerService, 'LoadPlayers').mockResolvedValue([]);
    component.ngOnInit();
    const teamAPointsControl = component.matchForm.get('teamAPoints')!;
    const teamBPointsControl = component.matchForm.get('teamBPoints')!;
    teamAPointsControl.setValue(0);
    expect(teamAPointsControl.valid).toBe(true);
    teamAPointsControl.setValue(-1);
    expect(teamAPointsControl.valid).toBe(false);
    teamBPointsControl.setValue(0);
    expect(teamBPointsControl.valid).toBe(true);
    teamBPointsControl.setValue(-1);
    expect(teamBPointsControl.valid).toBe(false);
  });

  it('should not save if no team has 200 points', () => {
    const toastr = TestBed.inject(ToastrService);
    jest.spyOn(toastr, 'warning');
    jest
      .spyOn(matchService, 'SaveMatch')
      .mockImplementation(
        (match: model.Match): Promise<model.Match> => Promise.resolve(match)
      );

    let idCounter = 1;
    jest.spyOn(playerService, 'SavePlayer').mockImplementation((player) => {
      return Promise.resolve(
        new model.Player({ ID: idCounter++, Name: player })
      );
    });
    jest.spyOn(playerService, 'LoadPlayers').mockResolvedValue([]);

    component.ngOnInit();
    const today = new Date().toISOString().split('T')[0];
    component.matchForm.setValue({
      matchDate: today,
      player1: 'Player 1',
      player2: 'Player 2',
      player3: 'Player 3',
      player4: 'Player 4',
      teamAPoints: 199,
      teamBPoints: 100,
    });
    component.save();

    expect(matchService.SaveMatch).not.toHaveBeenCalled();
    expect(toastr.warning).toHaveBeenCalledWith(
      'El equipo ganador debe tener 200 puntos.'
    );
  });

  it('should not save with both teams having 200 points', () => {
    const toastr = TestBed.inject(ToastrService);
    jest.spyOn(toastr, 'warning');
    jest
      .spyOn(matchService, 'SaveMatch')
      .mockImplementation(
        (match: model.Match): Promise<model.Match> => Promise.resolve(match)
      );

    let idCounter = 1;
    jest.spyOn(playerService, 'SavePlayer').mockImplementation((player) => {
      return Promise.resolve(
        new model.Player({ ID: idCounter++, Name: player })
      );
    });
    jest.spyOn(playerService, 'LoadPlayers').mockResolvedValue([]);

    component.ngOnInit();
    const today = new Date().toISOString().split('T')[0];
    component.matchForm.setValue({
      matchDate: today,
      player1: 'Player 1',
      player2: 'Player 2',
      player3: 'Player 3',
      player4: 'Player 4',
      teamAPoints: 200,
      teamBPoints: 200,
    });
    component.save();

    expect(matchService.SaveMatch).not.toHaveBeenCalled();
    expect(toastr.warning).toHaveBeenCalledWith(
      'Sólo puede haber un equipo ganador.'
    );
  });

  it('should not save with duplicate players', () => {
    jest
      .spyOn(matchService, 'SaveMatch')
      .mockImplementation(
        (match: model.Match): Promise<model.Match> => Promise.resolve(match)
      );

    let idCounter = 1;
    jest.spyOn(playerService, 'SavePlayer').mockImplementation((player) => {
      return Promise.resolve(
        new model.Player({ ID: idCounter++, Name: player })
      );
    });
    jest.spyOn(playerService, 'LoadPlayers').mockResolvedValue([]);
    component.ngOnInit();
    const today = new Date().toISOString().split('T')[0];
    component.matchForm.setValue({
      matchDate: today,
      player1: 'Player 1',
      player2: 'Player 1',
      player3: 'Player 3',
      player4: 'Player 4',
      teamAPoints: 200,
      teamBPoints: 100,
    });
    component.save();

    expect(matchService.SaveMatch).not.toHaveBeenCalled();
    expect(component.matchForm.hasError('duplicatePlayers')).toBeTruthy();

    component.matchForm.patchValue({
      player1: 'Player 1',
      player2: 'Player 2',
      player3: 'Player 1',
      player4: 'Player 4',
    });
    component.save();

    expect(matchService.SaveMatch).not.toHaveBeenCalled();
    expect(component.matchForm.hasError('duplicatePlayers')).toBeTruthy();

    component.matchForm.patchValue({
      player1: 'Player 1',
      player2: 'Player 2',
      player3: 'Player 3',
      player4: 'Player 1',
    });
    component.save();

    expect(matchService.SaveMatch).not.toHaveBeenCalled();
    expect(component.matchForm.hasError('duplicatePlayers')).toBeTruthy();

    component.matchForm.patchValue({
      player1: 'Player 1',
      player2: 'Player 2',
      player3: 'Player 2',
      player4: 'Player 4',
    });
    component.save();

    expect(matchService.SaveMatch).not.toHaveBeenCalled();
    expect(component.matchForm.hasError('duplicatePlayers')).toBeTruthy();

    component.matchForm.patchValue({
      player1: 'Player 1',
      player2: 'Player 2',
      player3: 'Player 3',
      player4: 'Player 2',
    });
    component.save();

    expect(matchService.SaveMatch).not.toHaveBeenCalled();
    expect(component.matchForm.hasError('duplicatePlayers')).toBeTruthy();

    component.matchForm.patchValue({
      player1: 'Player 1',
      player2: 'Player 2',
      player3: 'Player 4',
      player4: 'Player 4',
    });
    component.save();

    expect(matchService.SaveMatch).not.toHaveBeenCalled();
    expect(component.matchForm.hasError('duplicatePlayers')).toBeTruthy();
  });

  it('should save new players', async () => {
    jest
      .spyOn(matchService, 'SaveMatch')
      .mockImplementation(
        (match: model.Match): Promise<model.Match> => Promise.resolve(match)
      );

    let idCounter = 1;
    jest.spyOn(playerService, 'SavePlayer').mockImplementation((player) => {
      return Promise.resolve(
        new model.Player({ ID: idCounter++, Name: player })
      );
    });
    const player1 = new model.Player({ ID: 1, Name: 'Player 1' });
    const player2 = new model.Player({ ID: 2, Name: 'Player 2' });
    jest
      .spyOn(playerService, 'LoadPlayers')
      .mockResolvedValue([player1, player2]);

    await component.ngOnInit();
    const today = new Date().toISOString().split('T')[0];
    component.matchForm.setValue({
      matchDate: new Date(today).toISOString(),
      player1: 'Player 1',
      player2: 'Player 2',
      player3: 'Player 3',
      player4: 'Player 4',
      teamAPoints: 200,
      teamBPoints: 100,
    });

    component.save();

    expect(playerService.SavePlayer).toHaveBeenCalledTimes(2);
    expect(playerService.SavePlayer).toHaveBeenNthCalledWith(1, 'Player 3');
    expect(playerService.SavePlayer).toHaveBeenNthCalledWith(2, 'Player 4');

    const TeamA = new model.Team({
      Player1: new model.Player({ Name: 'Player 1' }),
      Player2: new model.Player({ Name: 'Player 2' }),
    });
    const TeamB = new model.Team({
      Player1: new model.Player({ Name: 'Player 3' }),
      Player2: new model.Player({ Name: 'Player 4' }),
    });
    const match = new model.Match({
      MatchDate: new Date(today).toISOString(),
      TeamA,
      TeamB,
      TeamAPoints: 200,
      TeamBPoints: 100,
    });
    expect(matchService.SaveMatch).toHaveBeenCalledWith(
      expect.objectContaining({ ...match })
    );
  });

  it('should navigate to home screen when saving a match', async () => {
    const router = TestBed.inject(Router);
    jest.spyOn(router, 'navigate');
    jest
      .spyOn(matchService, 'SaveMatch')
      .mockImplementation(
        (match: model.Match): Promise<model.Match> => Promise.resolve(match)
      );

    let idCounter = 1;
    jest.spyOn(playerService, 'SavePlayer').mockImplementation((player) => {
      return Promise.resolve(
        new model.Player({ ID: idCounter++, Name: player })
      );
    });
    const player1 = new model.Player({ ID: 1, Name: 'Player 1' });
    const player2 = new model.Player({ ID: 2, Name: 'Player 2' });
    jest
      .spyOn(playerService, 'LoadPlayers')
      .mockResolvedValue([player1, player2]);

    await component.ngOnInit();
    const today = new Date().toISOString().split('T')[0];
    component.matchForm.setValue({
      matchDate: new Date(today).toISOString(),
      player1: 'Player 1',
      player2: 'Player 2',
      player3: 'Player 3',
      player4: 'Player 4',
      teamAPoints: 200,
      teamBPoints: 100,
    });

    await component.save();

    expect(router.navigate).toHaveBeenCalledWith(['']);
  });

  it('should show toastr error message when saving a match fails', async () => {
    const router = TestBed.inject(Router);
    jest.spyOn(router, 'navigate');
    const toastr = TestBed.inject(ToastrService);
    jest.spyOn(toastr, 'error');
    jest
      .spyOn(matchService, 'SaveMatch')
      .mockImplementation(
        (): Promise<model.Match> => Promise.reject('Test error')
      );

    let idCounter = 1;
    jest.spyOn(playerService, 'SavePlayer').mockImplementation((player) => {
      return Promise.resolve(
        new model.Player({ ID: idCounter++, Name: player })
      );
    });
    const player1 = new model.Player({ ID: 1, Name: 'Player 1' });
    const player2 = new model.Player({ ID: 2, Name: 'Player 2' });
    jest
      .spyOn(playerService, 'LoadPlayers')
      .mockResolvedValue([player1, player2]);

    await component.ngOnInit();
    const today = new Date().toISOString().split('T')[0];
    component.matchForm.setValue({
      matchDate: new Date(today).toISOString(),
      player1: 'Player 1',
      player2: 'Player 2',
      player3: 'Player 3',
      player4: 'Player 4',
      teamAPoints: 200,
      teamBPoints: 100,
    });

    await component.save();

    expect(router.navigate).not.toHaveBeenCalled();
    expect(toastr.error).toHaveBeenCalledWith(
      'Ocurrió un error al intentar guardar la partida.'
    );
  });
});
