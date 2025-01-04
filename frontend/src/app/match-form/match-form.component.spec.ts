import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {
  FaIconLibrary,
  FontAwesomeModule,
} from '@fortawesome/angular-fontawesome';
import { faSave, faTimes } from '@fortawesome/free-solid-svg-icons';
import { ToastrModule } from 'ngx-toastr';
import { AutocompleteComponent } from '../autocomplete/autocomplete.component';
import { MatchFormComponent } from './match-form.component';

describe('MatchFormComponent', () => {
  let component: MatchFormComponent;
  let fixture: ComponentFixture<MatchFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AutocompleteComponent, MatchFormComponent],
      imports: [ToastrModule.forRoot(), FontAwesomeModule],
    }).compileComponents();
    const iconLibrary = TestBed.inject(FaIconLibrary);
    iconLibrary.addIcons(faSave, faTimes);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MatchFormComponent);
    component = fixture.componentInstance;
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
});
