import { TestBed } from '@angular/core/testing';
import { CacheService } from './cache.service';
import { of } from 'rxjs';

describe('CacheService', () => {
  let service: CacheService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CacheService);
    localStorage.clear();
    service.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('set and get', () => {
    it('should store and retrieve data', () => {
      const key = 'test_key';
      const data = { name: 'Test Data' };

      service.set(key, data);
      const result = service.get(key);

      expect(result).toEqual(data);
    });

    it('should return null for non-existent key', () => {
      const result = service.get('non_existent_key');
      expect(result).toBeNull();
    });

    it('should return null for expired data', () => {
      const key = 'test_key';
      const data = { name: 'Test Data' };
      const ttl = 100; // 100ms

      service.set(key, data);

      // Wait for expiration
      jest.useFakeTimers();
      jest.advanceTimersByTime(150);

      const result = service.get(key, ttl);
      expect(result).toBeNull();

      jest.useRealTimers();
    });
  });

  describe('has', () => {
    it('should return true for existing non-expired data', () => {
      const key = 'test_key';
      const data = { name: 'Test Data' };

      service.set(key, data);

      expect(service.has(key)).toBe(true);
    });

    it('should return false for non-existent key', () => {
      expect(service.has('non_existent_key')).toBe(false);
    });

    it('should return false for expired data', () => {
      const key = 'test_key';
      const data = { name: 'Test Data' };
      const ttl = 100;

      service.set(key, data);

      jest.useFakeTimers();
      jest.advanceTimersByTime(150);

      expect(service.has(key, ttl)).toBe(false);

      jest.useRealTimers();
    });
  });

  describe('remove', () => {
    it('should remove data from cache', () => {
      const key = 'test_key';
      const data = { name: 'Test Data' };

      service.set(key, data);
      expect(service.has(key)).toBe(true);

      service.remove(key);
      expect(service.has(key)).toBe(false);
    });
  });

  describe('clear', () => {
    it('should clear all cache', () => {
      service.set('key1', { data: 1 });
      service.set('key2', { data: 2 });
      service.set('key3', { data: 3 });

      expect(service.size()).toBe(3);

      service.clear();

      expect(service.size()).toBe(0);
    });
  });

  describe('cacheObservable', () => {
    it('should cache observable result', (done) => {
      const key = 'test_observable';
      const data = { name: 'Test Data' };
      const source$ = of(data);

      service.cacheObservable(key, source$).subscribe(result => {
        expect(result).toEqual(data);
        expect(service.has(key)).toBe(true);
        done();
      });
    });

    it('should return cached data on second call', (done) => {
      const key = 'test_observable';
      const data = { name: 'Test Data' };
      const source$ = of(data);

      // First call
      service.cacheObservable(key, source$).subscribe(() => {
        // Second call should return cached data
        service.cacheObservable(key, of({ name: 'Different Data' })).subscribe(result => {
          expect(result).toEqual(data); // Should return original cached data
          done();
        });
      });
    });
  });

  describe('localStorage persistence', () => {
    it('should persist data to localStorage', () => {
      const key = 'test_key';
      const data = { name: 'Test Data' };

      service.set(key, data, true);

      const stored = localStorage.getItem(`cache_${key}`);
      expect(stored).toBeTruthy();

      const parsed = JSON.parse(stored!);
      expect(parsed.data).toEqual(data);
    });

    it('should not persist to localStorage when flag is false', () => {
      const key = 'test_key';
      const data = { name: 'Test Data' };

      service.set(key, data, false);

      const stored = localStorage.getItem(`cache_${key}`);
      expect(stored).toBeNull();
    });

    it('should load data from localStorage on init', () => {
      const key = 'test_key';
      const data = { name: 'Test Data' };
      const entry = {
        data,
        timestamp: Date.now()
      };

      localStorage.setItem(`cache_${key}`, JSON.stringify(entry));

      // Create new service instance to trigger load
      const newService = new CacheService();

      expect(newService.has(key)).toBe(true);
      expect(newService.get(key)).toEqual(data);
    });
  });

  describe('size', () => {
    it('should return correct cache size', () => {
      expect(service.size()).toBe(0);

      service.set('key1', { data: 1 });
      expect(service.size()).toBe(1);

      service.set('key2', { data: 2 });
      expect(service.size()).toBe(2);

      service.remove('key1');
      expect(service.size()).toBe(1);

      service.clear();
      expect(service.size()).toBe(0);
    });
  });
});
