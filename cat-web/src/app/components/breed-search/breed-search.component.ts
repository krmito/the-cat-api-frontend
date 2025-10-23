import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CatsService } from '../../services/cats.service';
import { BreedSearchResult } from '../../models/breed.model';

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
        this.searchResults = results;
        this.loading = false;
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
