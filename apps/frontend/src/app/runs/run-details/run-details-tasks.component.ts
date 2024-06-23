import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { RunDetailsService } from './run-details.service';
import { RunStatus, Task, TaskStatus } from '@tskmgr/common';
import { AgGridEvent, ColDef, GetRowIdParams, GridApi, GridOptions, GridReadyEvent } from 'ag-grid-community';
import {
  checkboxCellRenderer,
  defaultGridOptions,
  durationValueFormatter,
  timeValueFormatter,
} from '../../common/ag-grid.utils';
import { debounceTime, distinctUntilChanged, filter, first, map, Subject, takeUntil, tap } from 'rxjs';
import { FilesCellRendererComponent } from '../cell-renderers/files-cell-renderer.component';
import { FormControl } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { RunDetailsTaskLogComponent } from './run-details-task-log.component';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';

@Component({
  selector: 'tskmgr-run-details-tasks',
  templateUrl: 'run-details-tasks.component.html',
  styleUrls: ['run-details-tasks.component.scss'],
})
export class RunDetailsTasksComponent implements OnDestroy, OnInit {
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
    columnDefs: this.columnDefs,
    onGridReady: this.onGridReady.bind(this),
    getRowId: (params: GetRowIdParams<Task>) => params.data.id.toString(),
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
    { name: 'Completed', filter: TaskStatus.Completed, count: 0, checked: false },
    this.taskFilterFailed,
  ];

  private api!: GridApi;

  constructor(
    private readonly runDetailsService: RunDetailsService,
    private modalService: NgbModal,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnInit() {
    this.route.queryParams
      .pipe(
        takeUntil(this.destroy$),
        tap((params) => {
          const fileId = params['fileId'];
          if (fileId) {
            this.openLogFileModal(fileId);
          }
        })
      )
      .subscribe();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.api?.sizeColumnsToFit();
  }

  refreshData(tasks: Task[], event: AgGridEvent): void {
    event.api.updateGridOptions({ rowData: tasks });
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
        tap((value) => event.api.updateGridOptions({ quickFilterText: value })),
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

  private openLogFileModal(fileId: string): void {
    const unsubscribe$ = new Subject<void>();
    const modalRef = this.modalService.open(RunDetailsTaskLogComponent, {
      scrollable: true,
      size: 'xl',
    });
    modalRef.componentInstance.logFileId = fileId;
    modalRef.closed
      .pipe(
        takeUntil(this.destroy$),
        takeUntil(unsubscribe$),
        tap(() => this.router.navigate([], { queryParams: {}, replaceUrl: true})),
        tap(() => {unsubscribe$.next(); unsubscribe$.complete();})
      )
      .subscribe();
    modalRef.dismissed
      .pipe(
        takeUntil(this.destroy$),
        takeUntil(unsubscribe$),
        tap(() => this.router.navigate([], { queryParams: {}, replaceUrl: true})),
        tap(() => {unsubscribe$.next(); unsubscribe$.complete();})
      )
      .subscribe();

    this.router.events.pipe(
      takeUntil(this.destroy$),
      takeUntil(unsubscribe$),
      filter(event => event instanceof NavigationStart && event.navigationTrigger === 'popstate'),
      tap(() => modalRef.dismiss())
    ).subscribe();
  }
}

interface TaskFilter {
  name: string;
  filter?: TaskStatus;
  count: number;
  checked: boolean;
}
