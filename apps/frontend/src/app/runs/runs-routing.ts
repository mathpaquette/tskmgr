import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./runs.component').then((m) => m.RunsComponent) },
  { path: ':id', pathMatch: 'full', redirectTo: '/runs/:id/tasks' },
  {
    path: ':id',
    loadComponent: () => import('./run-details/run-details.component').then((m) => m.RunDetailsComponent),
    children: [
      {
        path: 'tasks',
        loadComponent: () =>
          import('./run-details/run-details-tasks.component').then((m) => m.RunDetailsTasksComponent),
      },
      {
        path: 'execution',
        loadComponent: () =>
          import('./run-details/run-details-execution.component').then((m) => m.RunDetailsExecutionComponent),
      },
      {
        path: 'files',
        loadComponent: () =>
          import('./run-details/run-details-files.component').then((m) => m.RunDetailsFilesComponent),
      },
      {
        path: 'details',
        loadComponent: () =>
          import('./run-details/run-details-details.component').then((m) => m.RunDetailsDetailsComponent),
      },
    ],
  },
];
