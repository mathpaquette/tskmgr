import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RunsRoutingModule } from './runs-routing.module';
import { RunsComponent } from './runs.component';
import { TasksComponent } from './tasks/tasks.component';

@NgModule({
  declarations: [RunsComponent, TasksComponent],
  imports: [CommonModule, RunsRoutingModule],
})
export class RunsModule {}
