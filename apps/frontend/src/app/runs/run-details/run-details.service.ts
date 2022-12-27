import { Injectable, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { Run } from '@tskmgr/common';
import { RunsService } from '../runs.service';
import { HeaderService } from '../../common/header/header.service';

@Injectable()
export class RunDetailsService implements OnDestroy {
  readonly _run = new BehaviorSubject<Run | undefined>(undefined);
  readonly run$ = this._run.asObservable();
  readonly destroy$ = new Subject<void>();

  runId: number;

  constructor(private readonly runsService: RunsService, private readonly headerService: HeaderService) {
    this.headerService.refreshData$.pipe(takeUntil(this.destroy$)).subscribe(() => this.refreshData());
  }

  fetchRun(id: number): void {
    this.runId = id;
    this.refreshData();
  }

  private refreshData() {
    this.runsService.findById(this.runId).subscribe((x) => this._run.next(x));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
