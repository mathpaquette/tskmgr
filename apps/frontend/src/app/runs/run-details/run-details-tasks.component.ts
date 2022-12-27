import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { RunDetailsService } from './run-details.service';
import { Run, TaskStatus } from '@tskmgr/common';
import { AgGridEvent, ColDef, GridOptions, GridReadyEvent } from 'ag-grid-community';
import { checkboxCellRenderer, timeValueFormatter } from '../../common/ag-grid.util';
import { Subject, takeUntil } from 'rxjs';

@Component({
  template: `
    <div class="d-flex flex-column w-100">
      <div class="d-flex flex-row justify-content-end m-2">
        <div class="form-check form-check-inline">
          <input class="form-check-input" type="radio" name="inlineRadioOptions" id="inlineRadio1" value="option1" />
          <label class="form-check-label" for="inlineRadio1">All ({{ this.counts['ALL'] }})</label>
        </div>

        <div class="form-check form-check-inline">
          <input class="form-check-input" type="radio" name="inlineRadioOptions" id="inlineRadio2" value="option2" />
          <label class="form-check-label" for="inlineRadio2">Pending</label>
        </div>

        <div class="form-check form-check-inline">
          <input class="form-check-input" type="radio" name="inlineRadioOptions" id="inlineRadio3" value="option3" />
          <label class="form-check-label" for="inlineRadio3">Running</label>
        </div>

        <div class="form-check form-check-inline">
          <input class="form-check-input" type="radio" name="inlineRadioOptions" id="inlineRadio3" value="option3" />
          <label class="form-check-label" for="inlineRadio3">Completed</label>
        </div>

        <div class="form-check form-check-inline">
          <input class="form-check-input" type="radio" name="inlineRadioOptions" id="inlineRadio3" value="option3" />
          <label class="form-check-label" for="inlineRadio3">Failed</label>
        </div>
      </div>
      <div class="d-flex h-100">
        <ag-grid-angular
          class="ag-theme-alpine"
          [columnDefs]="columnDefs"
          [gridOptions]="gridOptions"
        ></ag-grid-angular>
      </div>
    </div>
  `,
  selector: 'tskmgr-run-details-tasks',
  styles: [
    `
      ag-grid-angular {
        width: 100%;
      }

      :host {
        display: flex;
        flex: 1;
      }
    `,
  ],
})
export class RunDetailsTasksComponent implements OnInit, OnDestroy {
  readonly columnDefs: ColDef[] = [
    // { field: 'id' },
    { field: 'name' },
    { field: 'type' },
    { field: 'command' },
    { field: 'arguments' },
    // { field: 'options' },
    { field: 'runnerId' },
    // { field: 'runnerInfo' },
    { field: 'status' },
    { field: 'cached', cellRenderer: checkboxCellRenderer },
    { field: 'duration', headerName: 'Duration (sec)' },
    { field: 'avgDuration', headerName: 'Avg Duration (sec)' },
    { field: 'priority' },
    { field: 'createdAt', cellRenderer: timeValueFormatter },
    { field: 'startedAt', cellRenderer: timeValueFormatter },
    { field: 'updatedAt', cellRenderer: timeValueFormatter },
    { field: 'endedAt', cellRenderer: timeValueFormatter },
    { field: 'files' },
  ];

  readonly gridOptions: GridOptions = {
    onGridReady: this.onGridReady.bind(this),
    paginationAutoPageSize: true,
    pagination: true,
  };

  readonly destroy$ = new Subject<void>();

  readonly counts = {
    ALL: 0,
    [TaskStatus.Pending]: 0,
    [TaskStatus.Running]: 0,
    [TaskStatus.Completed]: 0,
    [TaskStatus.Failed]: 0,
  };

  constructor(private readonly runDetailsService: RunDetailsService) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.gridOptions.api?.sizeColumnsToFit();
  }

  ngOnInit(): void {}

  refreshData(run: Run | undefined, event: AgGridEvent): void {
    if (!run) {
      return;
    }

    event.api.setRowData(run.tasks);
    event.api.sizeColumnsToFit();
  }

  updateCounts(run: Run | undefined): void {
    if (!run) {
      return;
    }

    this.counts['ALL'] = run.tasks.length;
    this.counts[TaskStatus.Pending] = run.tasks.filter((x) => x.status === TaskStatus.Pending).length;
    this.counts[TaskStatus.Running] = run.tasks.filter((x) => x.status === TaskStatus.Running).length;
    this.counts[TaskStatus.Completed] = run.tasks.filter((x) => x.status === TaskStatus.Completed).length;
    this.counts[TaskStatus.Failed] = run.tasks.filter((x) => x.status === TaskStatus.Failed).length;
  }

  onGridReady(event: GridReadyEvent): void {
    this.runDetailsService.run$.pipe(takeUntil(this.destroy$)).subscribe((x) => {
      this.refreshData(x, event);
      this.updateCounts(x);
    });
  }
}
