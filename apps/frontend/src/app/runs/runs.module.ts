import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RunsRoutingModule } from './runs-routing.module';
import { RunsComponent } from './runs.component';
import { AgGridModule } from 'ag-grid-angular';
import { RunCellRendererComponent } from './cell-renderers/run-cell-renderer.component';
import { RunDetailsComponent } from './run-details/run-details.component';
import { NgbAccordionModule } from '@ng-bootstrap/ng-bootstrap';
import { RunDetailsTasksComponent } from './run-details/tasks/run-details-tasks.component';
import { RunDetailsDetailsComponent } from './run-details/details/run-details-details.component';

@NgModule({
  declarations: [
    RunsComponent, //
    RunCellRendererComponent,
    RunDetailsComponent,
    RunDetailsTasksComponent,
    RunDetailsDetailsComponent,
  ],
  imports: [
    CommonModule, //
    RunsRoutingModule,
    AgGridModule,
    NgbAccordionModule,
  ],
})
export class RunsModule {}
