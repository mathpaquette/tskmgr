import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { RunsService } from './runs.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ColDef, GridApi, GridOptions, GridReadyEvent, RowDoubleClickedEvent } from 'ag-grid-community';
import {
  checkboxCellRenderer,
  defaultGridOptions,
  durationValueFormatter,
  updatedAtValueFormatter,
  urlCellRenderer,
} from '../common/ag-grid.utils';
import { HeaderService } from '../common/header/header.service';
import { RunIdCellRendererComponent } from './cell-renderers/run-id-cell-renderer.component';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'tskmgr-runs',
  template: `
    <div class="container-fs">
      <div class="second-row">
        <ag-grid-angular
          class="ag-theme-alpine"
          [columnDefs]="columnDefs"
          [gridOptions]="gridOptions"
        ></ag-grid-angular>
      </div>
    </div>
  `,
  styles: [
    `
      .second-row {
        flex: 1; /*  added, fix for IE  */
        min-height: 0; /*  added, fix for Firefox  */
        display: flex;
      }

      .container-fs {
        display: flex;
        flex-direction: column;
        height: 100%;
        width: 100%;
      }

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
export class RunsComponent implements OnInit, OnDestroy {
  constructor(
    private readonly runsService: RunsService, //
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private headerService: HeaderService
  ) {}

  readonly gridOptions: GridOptions = {
    ...defaultGridOptions,
    onGridReady: this.onGridReady.bind(this),
    onRowDoubleClicked: this.onRowDoubleClicked.bind(this),
    getRowId: (params) => params.data.id,
  };

  readonly columnDefs: ColDef[] = [
    { field: 'id', width: 100, suppressSizeToFit: true, cellRenderer: RunIdCellRendererComponent },
    { field: 'type', filter: true },
    { field: 'status', filter: true },
    { field: 'prioritization', filter: true },
    { field: 'failFast', cellRenderer: checkboxCellRenderer },
    { field: 'closed', cellRenderer: checkboxCellRenderer },
    { field: 'duration', valueFormatter: durationValueFormatter },
    { field: 'updatedAt', headerName: 'Last Update', cellRenderer: updatedAtValueFormatter },
    { field: 'name', headerName: 'CI Job', width: 400, cellRenderer: urlCellRenderer, suppressSizeToFit: true },
  ];

  private api!: GridApi;
  private search: string | undefined = undefined;
  private readonly destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.headerService.enableSearch();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.api?.sizeColumnsToFit();
  }

  refreshData(): void {
    this.runsService.findAll(this.search).subscribe((x) => {
      this.api?.updateGridOptions({ rowData: x });
    });
  }

  onGridReady(event: GridReadyEvent): void {
    this.api = event.api;
    this.headerService.search$.pipe(takeUntil(this.destroy$)).subscribe((x) => {
      this.search = x;
      this.refreshData();
    });

    this.headerService.refreshData$.pipe(takeUntil(this.destroy$)).subscribe(() => this.refreshData());
    event.api.sizeColumnsToFit();
  }

  onRowDoubleClicked(event: RowDoubleClickedEvent): void {
    this.router.navigate(['runs', event.data.id]);
  }
}
