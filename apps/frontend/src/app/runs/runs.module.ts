import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { RunsRoutingModule } from './runs-routing.module';
import { RunsComponent } from './runs.component';

const routes: Routes = [{ path: '', component: RunsComponent }];

@NgModule({
  declarations: [RunsComponent],
  imports: [CommonModule, RunsRoutingModule, RouterModule.forChild(routes)],
})
export class RunsModule {}
