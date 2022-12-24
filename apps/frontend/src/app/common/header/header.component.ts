import { Component } from '@angular/core';
import { HeaderService } from './header.service';
import { Observable } from 'rxjs';
import { IsActiveMatchOptions } from '@angular/router';

@Component({
  selector: 'tskmgr-header',
  template: `
    <nav class="navbar navbar-expand-md navbar-dark bg-dark">
      <div class="container-fluid">
        <a class="navbar-brand" href="https://github.com/mathpaquette/tskmgr"
          >tskmgr <span class="version">v1.0.0</span></a
        >
        <button
          class="navbar-toggler collapsed"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarCollapse"
          aria-controls="navbarCollapse"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="navbar-collapse collapse" id="navbarCollapse" style="">
          <ul ngbNav class="navbar-nav me-auto mb-2 mb-md-0">
            <li class="nav-item">
              <a
                class="nav-link"
                aria-current="page"
                routerLink="/runs"
                routerLinkActive="active"
                [routerLinkActiveOptions]="options"
                >Runs</a
              >
            </li>
            <li class="nav-item">
              <a class="nav-link" aria-current="page" routerLink="/settings" routerLinkActive="active">Settings</a>
            </li>
          </ul>
          <form class="d-flex" role="search" *ngIf="headerService.searchEnable$ | async">
            <input
              class="form-control me-2"
              type="search"
              placeholder="Search"
              aria-label="Search"
              [ngModel]="headerService.search$ | async"
              [ngModelOptions]="{ standalone: true }"
              (ngModelChange)="headerService.setSearch($event)"
            />
          </form>
        </div>
      </div>
    </nav>
  `,
  styles: [
    `
      .version {
        font-size: 10px;
      }
    `,
  ],
})
export class HeaderComponent {
  readonly search$: Observable<string>;
  readonly options: IsActiveMatchOptions = {
    queryParams: 'ignored',
    paths: 'exact',
    matrixParams: 'exact',
    fragment: 'exact',
  };

  constructor(public headerService: HeaderService) {
    this.search$ = headerService.search$;
  }
}
