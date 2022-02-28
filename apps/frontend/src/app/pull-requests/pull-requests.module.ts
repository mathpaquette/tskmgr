import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { PullRequestsRoutingModule } from './pull-requests-routing.module';
import { PullRequestsComponent } from './pull-requests.component';

const routes: Routes = [{ path: '', component: PullRequestsComponent }];

@NgModule({
  declarations: [PullRequestsComponent],
  imports: [CommonModule, PullRequestsRoutingModule, RouterModule.forChild(routes)],
})
export class PullRequestsModule {}
