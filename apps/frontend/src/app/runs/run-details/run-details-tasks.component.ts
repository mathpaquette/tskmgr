import { Component, HostListener, OnDestroy } from '@angular/core';
import { RunDetailsService } from './run-details.service';
import { RunStatus, Task, TaskStatus } from '@tskmgr/common';
import { AgGridEvent, ColDef, GridApi, GridOptions, GridReadyEvent } from 'ag-grid-community';
import {
  checkboxCellRenderer,
  defaultGridOptions,
  durationValueFormatter,
  timeValueFormatter,
} from '../../common/ag-grid.utils';
import { debounceTime, distinctUntilChanged, first, map, Subject, takeUntil, tap } from 'rxjs';
import { FilesCellRendererComponent } from '../cell-renderers/files-cell-renderer.component';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'tskmgr-run-details-tasks',
  templateUrl: 'run-details-tasks.component.html',
  styleUrls: ['run-details-tasks.component.scss'],
})
export class RunDetailsTasksComponent implements OnDestroy {
  readonly columnDefs: ColDef[] = [
    { field: 'id' },
    { field: 'name', filter: true },
    { field: 'type', filter: true },
    { field: 'command', filter: true },
    { field: 'files', cellRenderer: FilesCellRendererComponent },
    // { field: 'options' },
    { field: 'arguments', filter: true },
    // { field: 'runnerInfo' },
    { field: 'runnerId', filter: true },
    { field: 'status', filter: true },
    { field: 'cached', cellRenderer: checkboxCellRenderer },
    //{ field: 'createdAt', cellRenderer: timeValueFormatter },
    { field: 'priority', filter: true },
    // { field: 'updatedAt', cellRenderer: timeValueFormatter },
    { field: 'startedAt', cellRenderer: timeValueFormatter },
    { field: 'endedAt', cellRenderer: timeValueFormatter },
    { field: 'avgDuration', valueFormatter: durationValueFormatter },
    { field: 'duration', valueFormatter: durationValueFormatter },
  ];

  readonly quickFilter = new FormControl('');

  readonly gridOptions: GridOptions = {
    ...defaultGridOptions,
    onGridReady: this.onGridReady.bind(this),
  };

  readonly destroy$ = new Subject<void>();

  private readonly taskFilterFailed: TaskFilter = {
    name: 'Failed',
    filter: TaskStatus.Failed,
    count: 0,
    checked: false,
  };

  readonly taskFilters: TaskFilter[] = [
    { name: 'All', count: 0, checked: false },
    { name: 'Pending', filter: TaskStatus.Pending, count: 0, checked: false },
    { name: 'Running', filter: TaskStatus.Running, count: 0, checked: false },
    { name: 'Aborted', filter: TaskStatus.Aborted, count: 0, checked: false },
    { name: 'Completed', filter: TaskStatus.Completed, count: 0, checked: false },
    this.taskFilterFailed,
  ];

  private api!: GridApi;

  constructor(private readonly runDetailsService: RunDetailsService) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.api?.sizeColumnsToFit();
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
    this.api = event.api;
    this.runDetailsService.run$.pipe(first()).subscribe((x) => {
      if (x.status === RunStatus.Failed) {
        this.onCheckboxChange(this.taskFilterFailed);
      }
    });

    this.runDetailsService.tasks$.pipe(takeUntil(this.destroy$)).subscribe((x) => {
      this.refreshData(x, event);
      this.updateCounts(x);
    });

    this.quickFilter.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(200),
        distinctUntilChanged(),
        map((value) => (value ? value : '')),
        tap((value) => event.api.setQuickFilter(value)),
        tap((value) => console.log(value))
      )
      .subscribe();

    event.api.sizeColumnsToFit();
  }

  onCheckboxChange(taskFilter: TaskFilter): void {
    this.taskFilters.forEach((x) => (x.checked = false));

    if (!taskFilter.filter) {
      this.api?.setFilterModel({});
      return;
    }

    this.api?.setFilterModel({ status: { filterType: 'text', type: 'equals', filter: taskFilter.filter } });
    taskFilter.checked = true;
  }

  onQuickFilterClear(): void {
    this.quickFilter.reset();
  }
}

interface TaskFilter {
  name: string;
  filter?: TaskStatus;
  count: number;
  checked: boolean;
}
