import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RunsRoutingModule } from './runs-routing.module';
import { RunsComponent } from './runs.component';
import { TasksComponent } from './tasks/tasks.component';
import { AgGridModule } from 'ag-grid-angular';
import { TasksCellRendererComponent } from './cell-renderers/tasks-cell-renderer.component';

@NgModule({
  declarations: [RunsComponent, TasksComponent, TasksCellRendererComponent],
  imports: [CommonModule, RunsRoutingModule, AgGridModule.withComponents(TasksCellRendererComponent)],
})
export class RunsModule {}
