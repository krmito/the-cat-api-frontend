import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CatsService } from '../../services/cats.service';
import { BreedSearchResult } from '../../models/breed.model';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Component({
  selector: 'app-breed-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './breed-table.component.html',
  styleUrls: ['./breed-table.component.css']
})
export class BreedTableComponent implements OnInit {
  breeds: BreedSearchResult[] = [];
  filteredBreeds: BreedSearchResult[] = [];
  loading: boolean = false;
  error: string = '';
  searchTerm: string = '';
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(private catsService: CatsService) {}

  ngOnInit(): void {
    this.loadAllBreeds();
  }

  /**
   * Carga todas las razas con sus imágenes
   */
  loadAllBreeds(): void {
    this.loading = true;
    this.error = '';

    // Primero obtenemos todos los nombres
    this.catsService.getBreedNames().subscribe({
      next: (names) => {
        // Para cada nombre, buscamos su información completa
        const searchPromises = names.slice(0, 50).map(name =>
          this.catsService.searchBreeds(name, true).toPromise()
        );

        Promise.all(searchPromises).then(results => {
          const breeds = results
            .filter(result => result && result.length > 0)
            .map(result => result![0]);

            const imageRequests = breeds.map(breed => {
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
                  return of(breed);
                })
              );
            } else {
              return of(breed);
            }
          });

          if (imageRequests.length > 0) {
            forkJoin(imageRequests).subscribe({
              next: (breedsWithImages) => {
                this.breeds = breedsWithImages;
                this.filteredBreeds = [...this.breeds];
                this.loading = false;
              },
              error: (err) => {
                console.error('Error loading images:', err);
                this.breeds = breeds; // Mostrar resultados sin imágenes
                this.filteredBreeds = [...this.breeds];
                this.loading = false;
              }
            });
          } else {
            this.breeds = breeds;
            this.filteredBreeds = [...this.breeds];
            this.loading = false;
          }
        }).catch(error => {
          console.error('Error loading breeds:', error);
          this.error = 'Error al cargar las razas';
          this.loading = false;
        });
      },
      error: (error) => {
        console.error('Error loading breed names:', error);
        this.error = 'Error al cargar los nombres de las razas';
        this.loading = false;
      }
    });
  }

  /**
   * Filtra las razas basándose en el término de búsqueda
   */
  filterBreeds(): void {
    if (!this.searchTerm.trim()) {
      this.filteredBreeds = [...this.breeds];
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredBreeds = this.breeds.filter(breed =>
        breed.name.toLowerCase().includes(term) ||
        breed.origin?.toLowerCase().includes(term) ||
        breed.temperament?.toLowerCase().includes(term)
      );
    }
  }

  /**
   * Ordena las razas por columna
   */
  sortBy(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.filteredBreeds.sort((a, b) => {
      let valueA: any;
      let valueB: any;

      switch (column) {
        case 'name':
          valueA = a.name;
          valueB = b.name;
          break;
        case 'origin':
          valueA = a.origin || '';
          valueB = b.origin || '';
          break;
        case 'life_span':
          valueA = a.life_span || '';
          valueB = b.life_span || '';
          break;
        case 'affection_level':
          valueA = a.affection_level || 0;
          valueB = b.affection_level || 0;
          break;
        case 'energy_level':
          valueA = a.energy_level || 0;
          valueB = b.energy_level || 0;
          break;
        case 'intelligence':
          valueA = a.intelligence || 0;
          valueB = b.intelligence || 0;
          break;
        default:
          return 0;
      }

      if (valueA < valueB) {
        return this.sortDirection === 'asc' ? -1 : 1;
      }
      if (valueA > valueB) {
        return this.sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }

  /**
   * Obtiene el ícono de ordenamiento
   */
  getSortIcon(column: string): string {
    if (this.sortColumn !== column) {
      return '↕️';
    }
    return this.sortDirection === 'asc' ? '↑' : '↓';
  }

  /**
   * Obtiene una versión truncada del temperamento
   */
  getTruncatedTemperament(temperament: string | undefined): string {
    if (!temperament) return 'N/A';
    const words = temperament.split(',').slice(0, 3);
    return words.join(',') + (temperament.split(',').length > 3 ? '...' : '');
  }
}
