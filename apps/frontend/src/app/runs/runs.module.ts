import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RunsRoutingModule } from './runs-routing.module';
import { RunsComponent } from './runs.component';
import { AgGridModule } from 'ag-grid-angular';
import { TasksCellRendererComponent } from './cell-renderers/tasks-cell-renderer.component';
import { RunDetailsComponent } from './run-details/run-details.component';
import { NgbAccordionModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  declarations: [RunsComponent, TasksCellRendererComponent, RunDetailsComponent],
  imports: [
    CommonModule, //
    RunsRoutingModule,
    AgGridModule.withComponents(TasksCellRendererComponent),
    NgbAccordionModule,
  ],
})
export class RunsModule {}
