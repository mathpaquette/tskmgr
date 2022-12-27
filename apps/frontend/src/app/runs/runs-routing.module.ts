import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RunsComponent } from './runs.component';
import { RunDetailsComponent } from './run-details/run-details.component';
import { RunDetailsTasksComponent } from './run-details/run-details-tasks.component';
import { RunDetailsDetailsComponent } from './run-details/run-details-details.component';
import { RunDetailsFilesComponent } from './run-details/run-details-files.component';

const routes: Routes = [
  { path: '', component: RunsComponent },
  { path: ':id', pathMatch: 'full', redirectTo: '/runs/:id/tasks' },
  {
    path: ':id',
    component: RunDetailsComponent,
    children: [
      { path: 'tasks', component: RunDetailsTasksComponent },
      { path: 'files', component: RunDetailsFilesComponent },
      { path: 'details', component: RunDetailsDetailsComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RunsRoutingModule {}
