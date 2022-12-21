import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { RouterModule } from '@angular/router';
import { API_URL_TOKEN } from './common/api-url.token';
import { ApiUrl } from '@tskmgr/common';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TskmgrCommonModule } from './common/tskmgr-common.module';
import { SettingsComponent } from './common/settings/settings.component';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserAnimationsModule,
    NgbModule,
    HttpClientModule,
    TskmgrCommonModule,
    RouterModule.forRoot(
      [
        { path: '', redirectTo: 'runs', pathMatch: 'full' },
        { path: 'runs', loadChildren: () => import('./runs/runs.module').then((m) => m.RunsModule) },
        { path: 'settings', component: SettingsComponent },
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
