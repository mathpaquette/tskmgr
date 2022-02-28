import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { BuildsRoutingModule } from './builds-routing.module';
import { BuildsComponent } from './builds.component';

const routes: Routes = [{ path: '', component: BuildsComponent }];

@NgModule({
  declarations: [BuildsComponent],
  imports: [CommonModule, BuildsRoutingModule, RouterModule.forChild(routes)],
})
export class BuildsModule {}
