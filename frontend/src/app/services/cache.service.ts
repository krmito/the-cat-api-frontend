import { Injectable } from '@angular/core';
import { Observable, of, tap } from 'rxjs';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class CacheService {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutos por defecto

  constructor() {
    this.loadFromLocalStorage();
  }

  /**
   * Obtiene datos del caché si están disponibles y no han expirado
   */
  get<T>(key: string, ttl: number = this.DEFAULT_TTL): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    const now = Date.now();
    const age = now - entry.timestamp;

    if (age > ttl) {
      this.cache.delete(key);
      this.removeFromLocalStorage(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Guarda datos en el caché
   */
  set<T>(key: string, data: T, persistInLocalStorage: boolean = true): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now()
    };

    this.cache.set(key, entry);

    if (persistInLocalStorage) {
      this.saveToLocalStorage(key, entry);
    }
  }

  /**
   * Verifica si una clave existe en el caché y no ha expirado
   */
  has(key: string, ttl: number = this.DEFAULT_TTL): boolean {
    return this.get(key, ttl) !== null;
  }

  /**
   * Elimina una entrada del caché
   */
  remove(key: string): void {
    this.cache.delete(key);
    this.removeFromLocalStorage(key);
  }

  /**
   * Limpia todo el caché
   */
  clear(): void {
    this.cache.clear();
    this.clearLocalStorage();
  }

  /**
   * Obtiene el tamaño del caché
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Helper para usar con Observables
   */
  cacheObservable<T>(
    key: string,
    source: Observable<T>,
    ttl: number = this.DEFAULT_TTL,
    persistInLocalStorage: boolean = true
  ): Observable<T> {
    const cached = this.get<T>(key, ttl);

    if (cached !== null) {
      return of(cached);
    }

    return source.pipe(
      tap(data => this.set(key, data, persistInLocalStorage))
    );
  }

  // Métodos privados para localStorage
  private saveToLocalStorage(key: string, entry: CacheEntry<any>): void {
    try {
      localStorage.setItem(`cache_${key}`, JSON.stringify(entry));
    } catch (error) {
      console.warn('Error saving to localStorage:', error);
    }
  }

  private loadFromLocalStorage(): void {
    try {
      const keys = Object.keys(localStorage).filter(k => k.startsWith('cache_'));
      keys.forEach(key => {
        const actualKey = key.replace('cache_', '');
        const value = localStorage.getItem(key);
        if (value) {
          const entry = JSON.parse(value);
          this.cache.set(actualKey, entry);
        }
      });
    } catch (error) {
      console.warn('Error loading from localStorage:', error);
    }
  }

  private removeFromLocalStorage(key: string): void {
    try {
      localStorage.removeItem(`cache_${key}`);
    } catch (error) {
      console.warn('Error removing from localStorage:', error);
    }
  }

  private clearLocalStorage(): void {
    try {
      const keys = Object.keys(localStorage).filter(k => k.startsWith('cache_'));
      keys.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.warn('Error clearing localStorage:', error);
    }
  }
}
