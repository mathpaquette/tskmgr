import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { RunDetailsService } from './run-details.service';
import { Run } from '@tskmgr/common';

@Component({
  template: `
    <div class="d-flex flex-column w-100 m-3">
      <div>
        Info
        <ul class="list-group">
          <li class="list-group-item">id: {{ run?.id }}</li>
          <li class="list-group-item">A second item</li>
          <li class="list-group-item">A third item</li>
          <li class="list-group-item">A fourth item</li>
          <li class="list-group-item">And a fifth one</li>
        </ul>
      </div>
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
})
export class RunDetailsDetailsComponent implements OnInit, OnDestroy {
  run: Run | undefined;

  readonly destroy$ = new Subject<void>();

  constructor(private readonly runDetailsService: RunDetailsService) {}

  ngOnInit(): void {
    this.runDetailsService.run$.pipe(takeUntil(this.destroy$)).subscribe((x) => {
      this.run = x;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
