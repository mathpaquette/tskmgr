import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { RouterModule } from '@angular/router';
import { API_URL_TOKEN } from './common/api-url.token';
import { ApiUrl } from '@tskmgr/common';
import { HttpClientModule } from '@angular/common/http';
import { HeaderComponent } from './common/header/header.component';

@NgModule({
  declarations: [AppComponent, HeaderComponent],
  imports: [
    BrowserModule,
    HttpClientModule,
    RouterModule.forRoot(
      [
        {
          path: 'pull-requests',
          loadChildren: () => import('./pull-requests/pull-requests.module').then((m) => m.PullRequestsModule),
        },
        { path: 'tasks', loadChildren: () => import('./tasks/tasks.module').then((m) => m.TasksModule) },
        { path: 'runs', loadChildren: () => import('./runs/runs.module').then((m) => m.RunsModule) },
      ],
      { initialNavigation: 'enabledBlocking' }
    ),
  ],
  providers: [
    {
      provide: API_URL_TOKEN,
      useFactory: () => ApiUrl.create(''),
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
