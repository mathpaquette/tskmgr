import { Component, HostListener, Injector, OnDestroy, OnInit, afterNextRender, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
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
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { RunDetailsTaskLogComponent, TASK_LOG_FILE_ID } from './run-details-task-log.component';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import { themeAlpine } from 'ag-grid-community';
import { AgGridAngular } from 'ag-grid-angular';

@Component({
  selector: 'tskmgr-run-details-tasks',
  templateUrl: 'run-details-tasks.component.html',
  styleUrls: ['run-details-tasks.component.scss'],
  imports: [FormsModule, ReactiveFormsModule, AgGridAngular],
})
export class RunDetailsTasksComponent implements OnDestroy, OnInit {
  private readonly runDetailsService = inject(RunDetailsService);
  private modalService = inject(NgbModal);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private injector = inject(Injector);

  readonly theme = themeAlpine;

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
  };

  readonly taskFilters: TaskFilter[] = [
    { name: 'All' },
    { name: 'Pending', filter: TaskStatus.Pending },
    { name: 'Running', filter: TaskStatus.Running },
    { name: 'Aborted', filter: TaskStatus.Aborted },
    { name: 'Completed', filter: TaskStatus.Completed },
    this.taskFilterFailed,
  ];

  readonly selectedTaskFilter = signal<TaskStatus | undefined>(undefined);
  private readonly taskCounts = toSignal(
    this.runDetailsService.tasks$.pipe(map((tasks) => this.createTaskCounts(tasks))),
    { initialValue: this.createTaskCounts([]) },
  );

  private api!: GridApi;

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
        }),
      )
      .subscribe();
  }

  @HostListener('window:resize')
  onResize() {
    this.api?.sizeColumnsToFit();
  }

  refreshData(tasks: Task[], event: AgGridEvent): void {
    event.api.updateGridOptions({ rowData: tasks });
  }

  onGridReady(event: GridReadyEvent): void {
    this.api = event.api;
    afterNextRender(() => this.bindGrid(event), { injector: this.injector });
  }

  getTaskFilterCount(taskFilter: TaskFilter): number {
    const counts = this.taskCounts();
    return taskFilter.filter ? counts[taskFilter.filter] : counts.all;
  }

  isTaskFilterChecked(taskFilter: TaskFilter): boolean {
    return !!taskFilter.filter && this.selectedTaskFilter() === taskFilter.filter;
  }

  private bindGrid(event: GridReadyEvent): void {
    this.runDetailsService.run$.pipe(first()).subscribe((x) => {
      if (x.status === RunStatus.Failed) {
        this.onCheckboxChange(this.taskFilterFailed);
      }
    });

    this.runDetailsService.tasks$.pipe(takeUntil(this.destroy$)).subscribe((x) => {
      this.refreshData(x, event);
    });

    this.quickFilter.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(200),
        distinctUntilChanged(),
        map((value) => (value ? value : '')),
        tap((value) => event.api.updateGridOptions({ quickFilterText: value })),
        tap((value) => console.log(value)),
      )
      .subscribe();

    event.api.sizeColumnsToFit();
  }

  onCheckboxChange(taskFilter: TaskFilter): void {
    this.selectedTaskFilter.set(taskFilter.filter);

    if (!taskFilter.filter) {
      this.api?.setFilterModel({});
      return;
    }

    this.api?.setFilterModel({ status: { filterType: 'text', type: 'equals', filter: taskFilter.filter } });
  }

  onQuickFilterClear(): void {
    this.quickFilter.reset();
  }

  private openLogFileModal(fileId: string): void {
    const unsubscribe$ = new Subject<void>();
    const modalRef = this.modalService.open(RunDetailsTaskLogComponent, {
      injector: Injector.create({
        providers: [{ provide: TASK_LOG_FILE_ID, useValue: fileId }],
        parent: this.injector,
      }),
      scrollable: true,
      size: 'xl',
    });
    modalRef.closed
      .pipe(
        takeUntil(this.destroy$),
        takeUntil(unsubscribe$),
        tap(() => this.router.navigate([], { queryParams: {}, replaceUrl: true })),
        tap(() => {
          unsubscribe$.next();
          unsubscribe$.complete();
        }),
      )
      .subscribe();
    modalRef.dismissed
      .pipe(
        takeUntil(this.destroy$),
        takeUntil(unsubscribe$),
        tap(() => this.router.navigate([], { queryParams: {}, replaceUrl: true })),
        tap(() => {
          unsubscribe$.next();
          unsubscribe$.complete();
        }),
      )
      .subscribe();

    this.router.events
      .pipe(
        takeUntil(this.destroy$),
        takeUntil(unsubscribe$),
        filter((event) => event instanceof NavigationStart && event.navigationTrigger === 'popstate'),
        tap(() => modalRef.dismiss()),
      )
      .subscribe();
  }

  private createTaskCounts(tasks: Task[]): TaskCounts {
    const counts: TaskCounts = {
      all: tasks.length,
      [TaskStatus.Pending]: 0,
      [TaskStatus.Running]: 0,
      [TaskStatus.Aborted]: 0,
      [TaskStatus.Completed]: 0,
      [TaskStatus.Failed]: 0,
    };

    for (const task of tasks) {
      if (task.status in counts) {
        counts[task.status as TaskStatus]++;
      }
    }

    return counts;
  }
}

interface TaskFilter {
  name: string;
  filter?: TaskStatus;
}

type TaskCounts = Record<TaskStatus, number> & {
  all: number;
};
