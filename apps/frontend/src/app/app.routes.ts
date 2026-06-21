import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/runs', pathMatch: 'full' },
  { path: 'runs', loadChildren: () => import('./runs/runs-routing').then((m) => m.routes) },
  {
    path: 'settings',
    loadComponent: () => import('./common/settings/settings.component').then((m) => m.SettingsComponent),
  },
];
