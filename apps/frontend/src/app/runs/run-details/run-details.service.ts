import { Injectable, OnDestroy } from '@angular/core';
import { Observable, shareReplay, Subject, switchMap, takeUntil, takeWhile, tap, timer } from 'rxjs';
import { Run, Task, File } from '@tskmgr/common';
import { RunsService } from '../runs.service';
import { ActivatedRoute } from '@angular/router';

@Injectable()
export class RunDetailsService implements OnDestroy {
  readonly runId: number;

  readonly run$: Observable<Run>;
  readonly tasks$: Observable<Task[]>;
  readonly files$: Observable<File[]>;

  private readonly destroy$ = new Subject<void>();
  private running = true;

  private readonly pollingInterval$ = timer(0, 1000 * 10).pipe(takeUntil(this.destroy$));

  constructor(private readonly runsService: RunsService, private readonly activatedRoute: ActivatedRoute) {
    this.runId = Number(this.activatedRoute.snapshot.paramMap.get('id'));

    this.run$ = this.pollingInterval$.pipe(
      switchMap(() => this.runsService.findById(this.runId)),
      tap((x) => {
        if (x.endedAt) {
          this.running = false;
        }
      }),
      takeWhile(() => this.running, true),
      shareReplay(1)
    );

    this.tasks$ = this.pollingInterval$.pipe(
      switchMap(() => this.runsService.findTasksById(this.runId)),
      takeWhile(() => this.running, true)
    );

    this.files$ = this.pollingInterval$.pipe(
      switchMap(() => this.runsService.findFilesById(this.runId)),
      takeWhile(() => this.running, true)
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
