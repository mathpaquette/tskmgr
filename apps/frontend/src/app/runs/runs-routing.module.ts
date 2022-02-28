import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RunsComponent } from './runs.component';

const routes: Routes = [{ path: '', component: RunsComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RunsRoutingModule {}
