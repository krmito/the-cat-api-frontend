import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CatsService } from '../../services/cats.service';
import { BreedSearchResult } from '../../models/breed.model';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Component({
  selector: 'app-breed-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './breed-search.component.html',
  styleUrls: ['./breed-search.component.css']
})
export class BreedSearchComponent {
  searchTerm: string = '';
  searchResults: BreedSearchResult[] = [];
  loading: boolean = false;
  error: string = '';
  hasSearched: boolean = false;

  constructor(private catsService: CatsService) {}

  searchBreeds(): void {
    if (!this.searchTerm.trim()) {
      this.error = 'Por favor ingresa un término de búsqueda';
      return;
    }

    this.loading = true;
    this.error = '';
    this.hasSearched = true;

    this.catsService.searchBreeds(this.searchTerm.trim(), true).subscribe({
      next: (results) => {
        if (results.length > 0) {
          const imageRequests = results.map(breed => {
            if (breed.reference_image_id) {
              return this.catsService.getImagesByBreedId(breed.id).pipe(
                map(images => {
                  if (images && images.length > 0) {
                    breed.image = {
                      id: images[0].id,
                      url: images[0].url,
                      width: images[0].width,
                      height: images[0].height
                    };
                  }
                  return breed;
                }),
                catchError(err => {
                  console.error(`Error loading image for breed ${breed.id}:`, err);
                  return of(breed); // Retornar el breed sin imagen en caso de error
                })
              );
            } else {
              console.log(`No reference_image_id for breed ${breed.name}, keeping existing image:`, breed.image);
              return of(breed); // No hay reference_image_id, retornar el breed tal cual
            }
          });

          // Ejecutar todas las peticiones en paralelo
          forkJoin(imageRequests).subscribe({
            next: (breedsWithImages) => {
              console.log('Final breeds with images:', breedsWithImages);
              this.searchResults = breedsWithImages;
              this.loading = false;
            },
            error: (err) => {
              console.error('Error loading images:', err);
              this.searchResults = results; // Mostrar resultados sin imágenes
              this.loading = false;
            }
          });
        } else {
          this.searchResults = results;
          this.loading = false;
        }
      },
      error: (err) => {
        console.error('Error searching breeds:', err);
        this.error = 'Error al buscar razas. Por favor intenta de nuevo.';
        this.loading = false;
      }
    });
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.searchResults = [];
    this.error = '';
    this.hasSearched = false;
  }

  getTruncatedTemperament(temperament: string | undefined, maxLength: number = 100): string {
    if (!temperament) return 'N/A';
    return temperament.length > maxLength
      ? temperament.substring(0, maxLength) + '...'
      : temperament;
  }
}
