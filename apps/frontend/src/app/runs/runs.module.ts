import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RunsRoutingModule } from './runs-routing.module';
import { RunsComponent } from './runs.component';
import { AgGridModule } from 'ag-grid-angular';
import { RunIdCellRendererComponent } from './cell-renderers/run-id-cell-renderer.component';
import { RunDetailsComponent } from './run-details/run-details.component';
import { NgbAccordionModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { RunDetailsTasksComponent } from './run-details/run-details-tasks.component';
import { RunDetailsDetailsComponent } from './run-details/run-details-details.component';
import { RunDetailsFilesComponent } from './run-details/run-details-files.component';
import { TskmgrCommonModule } from '../common/tskmgr-common.module';
import { TaskIdCellRendererComponent } from './cell-renderers/task-id-cell-renderer.component';
import { FileIdCellRendererComponent } from './cell-renderers/file-id-cell-renderer.component';
import { FilesCellRendererComponent } from './cell-renderers/files-cell-renderer.component';

const CELL_RENDERERS = [
  RunIdCellRendererComponent,
  TaskIdCellRendererComponent,
  FileIdCellRendererComponent,
  FilesCellRendererComponent,
];

@NgModule({
  declarations: [
    CELL_RENDERERS,
    RunsComponent,
    RunDetailsComponent,
    RunDetailsTasksComponent,
    RunDetailsDetailsComponent,
    RunDetailsFilesComponent,
  ],
  imports: [
    CommonModule, //
    RunsRoutingModule,
    AgGridModule,
    NgbAccordionModule,
    TskmgrCommonModule,
    NgbTooltipModule,
  ],
})
export class RunsModule {}
