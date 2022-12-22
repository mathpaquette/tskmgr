import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { RunsService } from './runs.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ColDef, GridOptions, GridReadyEvent, RowClickedEvent, RowDoubleClickedEvent } from 'ag-grid-community';
import {
  checkboxCellRenderer,
  defaultGridOptions,
  durationValueFormatter,
  urlCellRenderer,
} from '../common/ag-grid.util';
import { HeaderService } from '../common/header/header.service';

@Component({
  selector: 'tskmgr-runs',
  template: `
    <div class="container-test">
      <div class="first-row" *ngIf="false">
        <div class="form-check">
          <input class="form-check-input" type="checkbox" value="" id="defaultCheck1" />
          <label class="form-check-label" for="defaultCheck1"> Only failed </label>
        </div>
      </div>
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

      .container-test {
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
    onRowClicked: this.onRowClicked.bind(this),
    getRowId: (params) => params.data.id,
  };
  readonly columnDefs: ColDef[] = [
    { field: 'id', width: 100, suppressSizeToFit: true },
    { field: 'name', width: 400, cellRenderer: urlCellRenderer, suppressSizeToFit: true },
    { field: 'type' },
    { field: 'status' },
    { field: 'prioritization' },
    { field: 'affinity', cellRenderer: checkboxCellRenderer },
    { field: 'failFast', cellRenderer: checkboxCellRenderer },
    { field: 'closed', cellRenderer: checkboxCellRenderer },
    { field: 'duration', headerName: 'Duration (sec)', valueFormatter: durationValueFormatter },

    // { field: 'leaderId' },
    // { field: 'createdAt', valueFormatter: dateValueFormatter },
    // { field: 'updatedAt', valueFormatter: dateValueFormatter },
    // { field: 'endedAt', valueFormatter: dateValueFormatter },
  ];

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.gridOptions.api?.sizeColumnsToFit();
  }

  ngOnInit(): void {
    this.headerService.search$.subscribe((x) => console.log(x));
  }

  updateData(): void {
    this.runsService.findAll().subscribe((x) => {
      this.gridOptions.api?.setRowData(x);
    });
  }

  ngOnDestroy() {
    console.log('destroy');
  }

  onGridReady(event: GridReadyEvent): void {
    this.updateData();
    this.headerService.refreshData$.subscribe(() => this.updateData());
    event.api.sizeColumnsToFit();
  }

  onRowClicked(event: RowClickedEvent): void {
    console.log('sd');
  }

  onRowDoubleClicked(event: RowDoubleClickedEvent): void {
    this.router.navigate(['runs', event.data.id]);
  }
}
