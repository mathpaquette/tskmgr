import { Component, HostListener, OnDestroy } from '@angular/core';
import { RunDetailsService } from './run-details.service';
import { TaskStatus, Task } from '@tskmgr/common';
import { AgGridEvent, ColDef, GridOptions, GridReadyEvent } from 'ag-grid-community';
import { checkboxCellRenderer, defaultGridOptions, timeValueFormatter } from '../../common/ag-grid.util';
import { Subject, takeUntil } from 'rxjs';
import { FilesCellRendererComponent } from '../cell-renderers/files-cell-renderer.component';

@Component({
  template: `
    <div class="d-flex flex-column w-100">
      <div class="d-flex flex-row justify-content-end m-2">
        <div class="form-check form-check-inline" *ngFor="let taskFilter of taskFilters; let i = index">
          <input
            class="form-check-input"
            type="radio"
            name="inlineRadioOptions"
            id="inlineRadio{{ i }}"
            value="option{{ i }}"
            (change)="onCheckboxChange(taskFilter)"
          />
          <label class="form-check-label" for="inlineRadio{{ i }}"
            >{{ taskFilter.name }} ({{ taskFilter.count }})</label
          >
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
export class RunDetailsTasksComponent implements OnDestroy {
  readonly columnDefs: ColDef[] = [
    { field: 'id' },
    { field: 'name' },
    { field: 'type', filter: true },
    { field: 'command' },
    { field: 'arguments' },
    // { field: 'options' },
    { field: 'runnerId' },
    // { field: 'runnerInfo' },
    { field: 'status', filter: true },
    { field: 'cached', cellRenderer: checkboxCellRenderer },
    { field: 'priority' },
    //{ field: 'createdAt', cellRenderer: timeValueFormatter },
    { field: 'startedAt', cellRenderer: timeValueFormatter },
    // { field: 'updatedAt', cellRenderer: timeValueFormatter },
    { field: 'endedAt', cellRenderer: timeValueFormatter },
    { field: 'avgDuration', headerName: 'Avg Duration (sec)' },
    { field: 'duration', headerName: 'Duration (sec)' },
    { field: 'files', cellRenderer: FilesCellRendererComponent },
  ];

  readonly gridOptions: GridOptions = {
    ...defaultGridOptions,
    onGridReady: this.onGridReady.bind(this),
    paginationAutoPageSize: true,
    pagination: true,
  };

  readonly destroy$ = new Subject<void>();

  readonly taskFilters: TaskFilter[] = [
    { name: 'All', count: 0 },
    { name: 'Pending', filter: TaskStatus.Pending, count: 0 },
    { name: 'Running', filter: TaskStatus.Running, count: 0 },
    { name: 'Completed', filter: TaskStatus.Completed, count: 0 },
    { name: 'Failed', filter: TaskStatus.Failed, count: 0 },
  ];

  constructor(private readonly runDetailsService: RunDetailsService) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.gridOptions.api?.sizeColumnsToFit();
  }

  refreshData(tasks: Task[], event: AgGridEvent): void {
    event.api.setRowData(tasks);
  }

  updateCounts(tasks: Task[]): void {
    for (const taskFilter of this.taskFilters) {
      if (!taskFilter.filter) {
        taskFilter.count = tasks.length;
        continue;
      }

      taskFilter.count = tasks.filter((x) => x.status === taskFilter.filter).length;
    }
  }

  onGridReady(event: GridReadyEvent): void {
    this.runDetailsService.tasks$.pipe(takeUntil(this.destroy$)).subscribe((x) => {
      this.refreshData(x, event);
      this.updateCounts(x);
    });

    event.api.sizeColumnsToFit();
  }

  onCheckboxChange(taskFilter: TaskFilter): void {
    if (!taskFilter.filter) {
      this.gridOptions.api?.setFilterModel({});
      return;
    }

    this.gridOptions.api?.setFilterModel({ status: { filterType: 'text', type: 'equals', filter: taskFilter.filter } });
  }
}

interface TaskFilter {
  name: string;
  filter?: TaskStatus;
  count: number;
}
