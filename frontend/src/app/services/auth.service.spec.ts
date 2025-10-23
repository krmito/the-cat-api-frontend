import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from '../models/user.model';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  const apiUrl = 'http://localhost:3000';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('should login user and store in localStorage', () => {
      const loginRequest: LoginRequest = {
        email: 'test@example.com',
        password: 'password123'
      };

      const mockResponse: LoginResponse = {
        status: 200,
        mensaje: 'Login exitoso',
        usuario: {
          id: '1',
          name: 'Test User',
          email: 'test@example.com'
        }
      };

      service.login(loginRequest).subscribe(response => {
        expect(response).toEqual(mockResponse);
        expect(localStorage.getItem('currentUser')).toBe(JSON.stringify(mockResponse.usuario));
        expect(service.currentUserValue).toEqual(mockResponse.usuario);
      });

      const req = httpMock.expectOne(`${apiUrl}/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(loginRequest);
      req.flush(mockResponse);
    });
  });

  describe('register', () => {
    it('should register new user', () => {
      const registerRequest: RegisterRequest = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };

      const mockResponse: RegisterResponse = {
        _id: '1',
        name: 'Test User',
        email: 'test@example.com'
      };

      service.register(registerRequest).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${apiUrl}/register`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(registerRequest);
      req.flush(mockResponse);
    });
  });

  describe('logout', () => {
    it('should clear user from localStorage and subject', () => {
      const user = { id: '1', name: 'Test User', email: 'test@example.com' };
      localStorage.setItem('currentUser', JSON.stringify(user));

      service.logout();

      expect(localStorage.getItem('currentUser')).toBeNull();
      expect(service.currentUserValue).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when user is authenticated', () => {
      const user = { id: '1', name: 'Test User', email: 'test@example.com' };
      localStorage.setItem('currentUser', JSON.stringify(user));

      // Create new service instance to load from localStorage
      const newService = new AuthService(TestBed.inject(HttpClientTestingModule) as any);

      expect(newService.isAuthenticated()).toBe(true);
    });

    it('should return false when user is not authenticated', () => {
      expect(service.isAuthenticated()).toBe(false);
    });
  });

  describe('currentUserValue', () => {
    it('should return current user value', () => {
      const user = { id: '1', name: 'Test User', email: 'test@example.com' };
      localStorage.setItem('currentUser', JSON.stringify(user));

      // Create new service instance to load from localStorage
      const newService = new AuthService(TestBed.inject(HttpClientTestingModule) as any);

      expect(newService.currentUserValue).toEqual(user);
    });
  });
});
