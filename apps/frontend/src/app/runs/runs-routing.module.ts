import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RunsComponent } from './runs.component';
import { TasksComponent } from './tasks/tasks.component';

const routes: Routes = [
  { path: '', component: RunsComponent },
  { path: ':id', component: RunsComponent },
  { path: ':id/tasks', component: TasksComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RunsRoutingModule {}
