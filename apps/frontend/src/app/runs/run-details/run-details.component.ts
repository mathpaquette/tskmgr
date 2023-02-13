import { Component, OnInit } from '@angular/core';
import { Run } from '@tskmgr/common';
import { RunDetailsService } from './run-details.service';
import { Observable, Subject } from 'rxjs';

@Component({
  selector: 'tskmgr-run-details',
  template: `
    <div class="container-fluid mt-2 d-flex flex-column">
      <nav
        style="--bs-breadcrumb-divider: url(&#34;data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8'%3E%3Cpath d='M2.5 0L1 1.5 3.5 4 1 6.5 2.5 8l4-4-4-4z' fill='currentColor'/%3E%3C/svg%3E&#34;);"
        aria-label="breadcrumb"
      >
        <ol class="breadcrumb">
          <li class="breadcrumb-item"><a routerLink="/runs">Runs</a></li>
          <li class="breadcrumb-item active" aria-current="page">
            {{ (run$ | async)?.name }} <tskmgr-run-status [run]="run$ | async"></tskmgr-run-status>
          </li>
        </ol>
      </nav>

      <ul class="nav nav-tabs">
        <li class="nav-item">
          <a class="nav-link" routerLink="tasks" routerLinkActive="active">Tasks</a>
        </li>

        <li class="nav-item">
          <a class="nav-link" routerLink="files" routerLinkActive="active">Files</a>
        </li>

        <li class="nav-item">
          <a class="nav-link" routerLink="details" routerLinkActive="active">Details</a>
        </li>
      </ul>
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex: 1;
      }
    `,
  ],
  providers: [RunDetailsService],
})
export class RunDetailsComponent implements OnInit {
  run$: Observable<Run>;

  readonly destroy$ = new Subject<void>();

  constructor(private runDetailsService: RunDetailsService) {}

  ngOnInit(): void {
    this.run$ = this.runDetailsService.run$;
  }
}
