import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Breed, BreedSearchResult } from '../models/breed.model';
import { CacheService } from './cache.service';

@Injectable({
  providedIn: 'root'
})
export class CatsService {
  private apiUrl = 'http://localhost:3000';
  private readonly CACHE_TTL = 10 * 60 * 1000; // 10 minutos

  constructor(
    private http: HttpClient,
    private cacheService: CacheService
  ) { }

  /**
   * Obtiene la lista de nombres de todas las razas (con caché)
   */
  getBreedNames(): Observable<string[]> {
    const cacheKey = 'breed_names';
    return this.cacheService.cacheObservable(
      cacheKey,
      this.http.get<string[]>(`${this.apiUrl}/breeds`),
      this.CACHE_TTL
    );
  }

  /**
   * Obtiene información de una raza específica por ID (con caché)
   */
  getBreedById(breedId: string): Observable<{ name: string }> {
    const cacheKey = `breed_${breedId}`;
    return this.cacheService.cacheObservable(
      cacheKey,
      this.http.get<{ name: string }>(`${this.apiUrl}/breeds/${breedId}`),
      this.CACHE_TTL
    );
  }

  /**
   * Busca razas por nombre con opción de incluir imagen (con caché)
   */
  searchBreeds(query: string, attachImage: boolean = true): Observable<BreedSearchResult[]> {
    const cacheKey = `search_${query}_${attachImage}`;
    const params: any = { q: query };
    return this.cacheService.cacheObservable(
      cacheKey,
      this.http.get<BreedSearchResult[]>(`${this.apiUrl}/breeds/search`, { params }),
      this.CACHE_TTL
    );
  }

  /**
   * Obtiene todas las razas con sus imágenes (con caché agresivo)
   */
  getAllBreedsWithImages(): Observable<BreedSearchResult[]> {
    const cacheKey = 'all_breeds_with_images';
    // Usamos una búsqueda vacía para obtener todas las razas
    return this.cacheService.cacheObservable(
      cacheKey,
      this.http.get<BreedSearchResult[]>(`${this.apiUrl}/breeds/search`, {
        params: { q: '', attach_image: '1' }
      }),
      this.CACHE_TTL * 2 // Caché más largo para todas las razas (20 minutos)
    );
  }

  /**
   * Obtiene imágenes de una raza por su ID (con caché)
   */
  getImagesByBreedId(breedId: string): Observable<any[]> {
    const cacheKey = `images_breed_${breedId}`;
    return this.cacheService.cacheObservable(
      cacheKey,
      this.http.get<any[]>(`${this.apiUrl}/imagesByBreedId/${breedId}`),
      this.CACHE_TTL
    );
  }

  /**
   * Limpia el caché de razas
   */
  clearCache(): void {
    this.cacheService.clear();
  }

  /**
   * Obtiene estadísticas del caché
   */
  getCacheStats(): { size: number } {
    return {
      size: this.cacheService.size()
    };
  }
}
