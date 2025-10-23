import { TestBed, ComponentFixture } from '@angular/core/testing';
import { RegistroComponent } from './registro.component';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { FormsModule } from '@angular/forms';

describe('RegistroComponent', () => {
  let component: RegistroComponent;
  let fixture: ComponentFixture<RegistroComponent>;
  let authServiceMock: jest.Mocked<Partial<AuthService>>;
  let routerMock: jest.Mocked<Partial<Router>>;

  beforeEach(async () => {
    authServiceMock = {
      register: jest.fn()
    };

    routerMock = {
      navigate: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [RegistroComponent, FormsModule],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegistroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show error when fields are empty', () => {
    component.name = '';
    component.email = '';
    component.password = '';
    component.confirmPassword = '';
    component.onSubmit();
    expect(component.error).toBe('Por favor, completa todos los campos');
  });

  it('should validate email format', () => {
    component.name = 'Test User';
    component.email = 'invalid-email';
    component.password = 'password123';
    component.confirmPassword = 'password123';
    component.onSubmit();
    expect(component.error).toBe('Por favor, ingresa un email válido');
  });

  it('should validate password minimum length', () => {
    component.name = 'Test User';
    component.email = 'test@example.com';
    component.password = '12345';
    component.confirmPassword = '12345';
    component.onSubmit();
    expect(component.error).toBe('La contraseña debe tener al menos 6 caracteres');
  });

  it('should validate passwords match', () => {
    component.name = 'Test User';
    component.email = 'test@example.com';
    component.password = 'password123';
    component.confirmPassword = 'different123';
    component.onSubmit();
    expect(component.error).toBe('Las contraseñas no coinciden');
  });

  it('should call authService.register with correct data', () => {
    const mockResponse = {
      _id: '1',
      name: 'Test User',
      email: 'test@example.com'
    };
    authServiceMock.register = jest.fn().mockReturnValue(of(mockResponse));

    component.name = 'Test User';
    component.email = 'test@example.com';
    component.password = 'password123';
    component.confirmPassword = 'password123';
    component.onSubmit();

    expect(authServiceMock.register).toHaveBeenCalledWith({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    });
  });

  it('should show success message and navigate to login on successful registration', (done) => {
    const mockResponse = {
      _id: '1',
      name: 'Test User',
      email: 'test@example.com'
    };
    authServiceMock.register = jest.fn().mockReturnValue(of(mockResponse));

    component.name = 'Test User';
    component.email = 'test@example.com';
    component.password = 'password123';
    component.confirmPassword = 'password123';
    component.onSubmit();

    expect(component.success).toBe(true);
    expect(component.loading).toBe(false);

    setTimeout(() => {
      expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
      done();
    }, 2100);
  });

  it('should show error message on registration failure', () => {
    const errorResponse = { error: { mensaje: 'El email ya existe' } };
    authServiceMock.register = jest.fn().mockReturnValue(throwError(() => errorResponse));

    component.name = 'Test User';
    component.email = 'test@example.com';
    component.password = 'password123';
    component.confirmPassword = 'password123';
    component.onSubmit();

    expect(component.error).toBe('El email ya existe');
    expect(component.loading).toBe(false);
  });

  it('should navigate to login when goToLogin is called', () => {
    component.goToLogin();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should validate email correctly', () => {
    expect(component.isValidEmail('test@example.com')).toBe(true);
    expect(component.isValidEmail('invalid-email')).toBe(false);
    expect(component.isValidEmail('test@')).toBe(false);
    expect(component.isValidEmail('@example.com')).toBe(false);
  });
});
