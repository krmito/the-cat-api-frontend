import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import { AuthService } from './services/auth.service';
import { provideHttpClient } from '@angular/common/http';
import { of } from 'rxjs';

describe('AppComponent', () => {
  let authServiceMock: jest.Mocked<Partial<AuthService>>;

  beforeEach(async () => {
    authServiceMock = {
      currentUser: of(null),
      logout: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [AppComponent, RouterTestingModule],
      providers: [
        provideHttpClient(),
        { provide: AuthService, useValue: authServiceMock }
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should have the correct title', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toBe('Cat Web - Explorador de Razas de Gatos');
  });

  it('should render title in h1 tag', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const h1Element = compiled.querySelector('h1');
    expect(h1Element?.textContent).toContain('Cat Web - Explorador de Razas de Gatos');
  });

  it('should initialize with no current user', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.currentUser).toBeNull();
  });
});
