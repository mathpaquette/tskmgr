import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RunsComponent } from './runs.component';
import { RunDetailsComponent } from './run-details/run-details.component';

const routes: Routes = [
  { path: '', component: RunsComponent },
  { path: ':id', component: RunDetailsComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RunsRoutingModule {}
