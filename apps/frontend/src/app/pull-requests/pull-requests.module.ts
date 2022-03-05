import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PullRequestsRoutingModule } from './pull-requests-routing.module';
import { PullRequestsComponent } from './pull-requests.component';
import { AgGridModule } from 'ag-grid-angular';
import { RunsCellRendererComponent } from './cell-renderers/runs-cell-renderer.component';

@NgModule({
  declarations: [PullRequestsComponent, RunsCellRendererComponent],
  imports: [CommonModule, PullRequestsRoutingModule, AgGridModule.withComponents(RunsCellRendererComponent)],
})
export class PullRequestsModule {}
