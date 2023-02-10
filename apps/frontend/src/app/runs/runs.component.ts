import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { RunsService } from './runs.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ColDef, GridOptions, GridReadyEvent, RowClickedEvent, RowDoubleClickedEvent } from 'ag-grid-community';
import { checkboxCellRenderer, dateValueFormatter, defaultGridOptions, urlCellRenderer } from '../common/ag-grid.util';
import { HeaderService } from '../common/header/header.service';
import { RunIdCellRendererComponent } from './cell-renderers/run-id-cell-renderer.component';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'tskmgr-runs',
  template: `
    <div class="container-fs">
      <!--      <div class="first-row">-->
      <!--        <div class="form-check">-->
      <!--          <input class="form-check-input" type="checkbox" value="" id="defaultCheck1"/>-->
      <!--          <label class="form-check-label" for="defaultCheck1"> Only failed </label>-->
      <!--        </div>-->
      <!--      </div>-->
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
      .first-row {
        display: flex;
      }

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
    { field: 'name', width: 400, cellRenderer: urlCellRenderer, suppressSizeToFit: true },
    { field: 'type', filter: true },
    { field: 'status', filter: true },
    { field: 'prioritization', filter: true },
    { field: 'affinity', cellRenderer: checkboxCellRenderer },
    { field: 'failFast', cellRenderer: checkboxCellRenderer },
    { field: 'closed', cellRenderer: checkboxCellRenderer },
    { field: 'duration', headerName: 'Duration (sec)' },
    { field: 'updatedAt', cellRenderer: dateValueFormatter },
  ];

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
    this.gridOptions.api?.sizeColumnsToFit();
  }

  refreshData(): void {
    this.runsService.findAll(this.search).subscribe((x) => {
      this.gridOptions.api?.setRowData(x);
    });
  }

  onGridReady(event: GridReadyEvent): void {
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
