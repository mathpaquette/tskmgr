import { Component, OnInit, Optional } from '@angular/core';
import { RunsService } from '../runs.service';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Run } from '@tskmgr/common';

@Component({
  selector: 'tskmgr-run-details',
  template: `
    <div class="container mt-2">
      <nav
        style="--bs-breadcrumb-divider: url(&#34;data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8'%3E%3Cpath d='M2.5 0L1 1.5 3.5 4 1 6.5 2.5 8l4-4-4-4z' fill='currentColor'/%3E%3C/svg%3E&#34;);"
        aria-label="breadcrumb"
      >
        <ol class="breadcrumb">
          <li class="breadcrumb-item"><a routerLink="/runs">Runs</a></li>
          <li class="breadcrumb-item active" aria-current="page">{{ run?.name }}</li>
        </ol>
      </nav>

      <ul class="nav nav-tabs">
        <li class="nav-item">
          <a class="nav-link" routerLink="tasks" routerLinkActive="active">Tasks</a>
        </li>

        <li class="nav-item">
          <a class="nav-link" routerLink="details" routerLinkActive="active">Details</a>
        </li>
      </ul>
      <router-outlet></router-outlet>
    </div>
  `,
  styleUrls: ['./run-details.component.scss'],
})
export class RunDetailsComponent implements OnInit {
  constructor(private runService: RunsService, private activatedRoute: ActivatedRoute) {}

  run: Run | null;

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe((x) => {
      const id = x.get('id');
      if (!id) {
        return;
      }

      this.fetchData(Number(id));
    });
  }

  async fetchData(id: number): Promise<void> {
    this.run = await firstValueFrom(this.runService.findById(id));
  }
}
