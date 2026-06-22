import { provideHttpClient } from '@angular/common/http';
import { enableProdMode, provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, withEnabledBlockingInitialNavigation } from '@angular/router';
import { ApiUrl } from '@tskmgr/common';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { API_URL_TOKEN } from './app/common/api-url.token';
import { environment } from './environments/environment';

import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
ModuleRegistry.registerModules([AllCommunityModule]);

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes, withEnabledBlockingInitialNavigation()),
    provideHttpClient(),
    {
      provide: API_URL_TOKEN,
      useFactory: () => ApiUrl.create(''),
    },
  ],
}).catch((err) => console.error(err));
