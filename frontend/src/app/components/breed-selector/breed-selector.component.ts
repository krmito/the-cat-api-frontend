import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CatsService } from '../../services/cats.service';
import { BreedSearchResult } from '../../models/breed.model';

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
    this.catsService.searchBreeds(this.selectedBreedName, true).subscribe({
      next: (breeds) => {
        if (breeds && breeds.length > 0) {
          this.selectedBreed = breeds[0];
          this.breedImage = this.selectedBreed?.image?.url || '';
        } else {
          this.error = 'No se encontró información de la raza';
          this.selectedBreed = null;
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
