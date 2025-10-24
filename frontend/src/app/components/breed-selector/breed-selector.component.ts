import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CatsService } from '../../services/cats.service';
import { BreedSearchResult } from '../../models/breed.model';
import { switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-breed-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './breed-selector.component.html',
  styleUrls: ['./breed-selector.component.css']
})
export class BreedSelectorComponent implements OnInit {
  breedNames: string[] = [];
  selectedBreedName: string = '';
  selectedBreed: BreedSearchResult | null = null;
  loading: boolean = false;
  error: string = '';
  breedImage: string = '';

  constructor(private catsService: CatsService) {}

  ngOnInit(): void {
    this.loadBreedNames();
  }

  /**
   * Carga la lista de nombres de razas
   */
  loadBreedNames(): void {
    this.loading = true;
    this.catsService.getBreedNames().subscribe({
      next: (names) => {
        this.breedNames = names;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading breed names:', error);
        this.error = 'Error al cargar las razas';
        this.loading = false;
      }
    });
  }

  /**
   * Maneja el cambio de selección en el dropdown
   */
  onBreedSelect(): void {
    if (!this.selectedBreedName) {
      this.selectedBreed = null;
      return;
    }

    this.loading = true;
    this.error = '';

    // Buscar la raza seleccionada con imagen
    this.catsService.searchBreeds(this.selectedBreedName, true).pipe(
      switchMap(breeds => {
        if (breeds && breeds.length > 0) {
          const breed = breeds[0];
          this.selectedBreed = breed;

          if (breed.reference_image_id) {
            return this.catsService.getImagesByBreedId(breed.id).pipe(
              catchError(err => {
                console.error(`Error loading image for breed ${breed.id}:`, err);
                return of([]); 
              })
            );
          } else {
            return of(breed.image ? [breed.image] : []);
          }
        } else {
          this.error = 'No se encontró información de la raza';
          this.selectedBreed = null;
          return of([]);
        }
      })
    ).subscribe({
      next: (images) => {
        if (images && images.length > 0 && this.selectedBreed) {
          this.selectedBreed.image = {
            id: images[0].id,
            url: images[0].url,
            width: images[0].width,
            height: images[0].height
          };
          this.breedImage = images[0].url;
        } else if (this.selectedBreed) {
          this.breedImage = '';
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading breed details:', error);
        this.error = 'Error al cargar los detalles de la raza';
        this.loading = false;
        this.selectedBreed = null;
        this.breedImage = '';
      }
    });
  }
}
