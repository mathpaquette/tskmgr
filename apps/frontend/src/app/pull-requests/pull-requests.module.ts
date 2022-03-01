import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PullRequestsRoutingModule } from './pull-requests-routing.module';
import { PullRequestsComponent } from './pull-requests.component';

@NgModule({
  declarations: [PullRequestsComponent],
  imports: [CommonModule, PullRequestsRoutingModule],
})
export class PullRequestsModule {}
