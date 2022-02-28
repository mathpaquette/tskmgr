import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { TasksRoutingModule } from './tasks-routing.module';
import { TasksComponent } from './tasks.component';

const routes: Routes = [{ path: '', component: TasksComponent }];

@NgModule({
  declarations: [TasksComponent],
  imports: [CommonModule, TasksRoutingModule, RouterModule.forChild(routes)],
})
export class TasksModule {}
