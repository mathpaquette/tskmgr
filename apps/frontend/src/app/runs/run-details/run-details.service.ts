import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Run } from '@tskmgr/common';
import { RunsService } from '../runs.service';
import { HeaderService } from '../../common/header/header.service';

@Injectable()
export class RunDetailsService {
  readonly _run = new BehaviorSubject<Run | undefined>(undefined);
  readonly run$ = this._run.asObservable();

  runId: number;

  constructor(private readonly runsService: RunsService, private readonly headerService: HeaderService) {
    this.headerService.refreshData$.subscribe(() => this.refreshData());
  }

  fetchRun(id: number): void {
    this.runId = id;
    this.refreshData();
  }

  private refreshData() {
    this.runsService.findById(this.runId).subscribe((x) => this._run.next(x));
  }
}
