import { TestBed, ComponentFixture } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { FormsModule } from '@angular/forms';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceMock: jest.Mocked<Partial<AuthService>>;
  let routerMock: jest.Mocked<Partial<Router>>;

  beforeEach(async () => {
    authServiceMock = {
      login: jest.fn()
    };

    routerMock = {
      navigate: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [LoginComponent, FormsModule],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show error when email or password is empty', () => {
    component.email = '';
    component.password = '';
    component.onSubmit();
    expect(component.error).toBe('Por favor, ingresa email y contraseña');
  });

  it('should validate email format', () => {
    component.email = 'invalid-email';
    component.password = 'password123';
    component.onSubmit();
    expect(component.error).toBe('Por favor, ingresa un email válido');
  });

  it('should call authService.login with correct credentials', () => {
    const mockResponse = {
      status: 200,
      mensaje: 'Login exitoso',
      usuario: { id: '1', name: 'Test User', email: 'test@example.com' }
    };
    authServiceMock.login = jest.fn().mockReturnValue(of(mockResponse));

    component.email = 'test@example.com';
    component.password = 'password123';
    component.onSubmit();

    expect(authServiceMock.login).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123'
    });
  });

  it('should navigate to /breeds on successful login', () => {
    const mockResponse = {
      status: 200,
      mensaje: 'Login exitoso',
      usuario: { id: '1', name: 'Test User', email: 'test@example.com' }
    };
    authServiceMock.login = jest.fn().mockReturnValue(of(mockResponse));

    component.email = 'test@example.com';
    component.password = 'password123';
    component.onSubmit();

    expect(routerMock.navigate).toHaveBeenCalledWith(['/breeds']);
  });

  it('should show error message on login failure', () => {
    const errorResponse = { error: { mensaje: 'Credenciales inválidas' } };
    authServiceMock.login = jest.fn().mockReturnValue(throwError(() => errorResponse));

    component.email = 'test@example.com';
    component.password = 'wrongpassword';
    component.onSubmit();

    expect(component.error).toBe('Credenciales inválidas');
    expect(component.loading).toBe(false);
  });

  it('should navigate to registro when goToRegister is called', () => {
    component.goToRegister();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/registro']);
  });

  it('should validate email correctly', () => {
    expect(component.isValidEmail('test@example.com')).toBe(true);
    expect(component.isValidEmail('invalid-email')).toBe(false);
    expect(component.isValidEmail('test@')).toBe(false);
    expect(component.isValidEmail('@example.com')).toBe(false);
  });
});
