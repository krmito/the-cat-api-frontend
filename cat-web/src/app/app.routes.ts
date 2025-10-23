import { Routes } from '@angular/router';
import { BreedSelectorComponent } from './components/breed-selector/breed-selector.component';
import { BreedTableComponent } from './components/breed-table/breed-table.component';
import { BreedSearchComponent } from './components/breed-search/breed-search.component';
import { LoginComponent } from './components/login/login.component';
import { RegistroComponent } from './components/registro/registro.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'breeds', component: BreedSelectorComponent, canActivate: [authGuard] },
  { path: 'table', component: BreedTableComponent, canActivate: [authGuard] },
  { path: 'search', component: BreedSearchComponent, canActivate: [authGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent },
  { path: '**', redirectTo: '/login' }
];
