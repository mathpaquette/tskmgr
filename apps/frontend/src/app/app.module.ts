import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    RouterModule.forRoot(
      [
        { path: 'pull-requests', loadChildren: () => import('./pull-requests/pull-requests.module').then((m) => m.PullRequestsModule) },
        { path: 'builds', loadChildren: () => import('./builds/builds.module').then((m) => m.BuildsModule) },
        { path: 'tasks', loadChildren: () => import('./tasks/tasks.module').then((m) => m.TasksModule) },
      ],
      { initialNavigation: 'enabledBlocking' }
    ),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
