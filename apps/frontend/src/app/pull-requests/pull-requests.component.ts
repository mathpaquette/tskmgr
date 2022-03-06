import { Component, OnInit } from '@angular/core';
import { PullRequestsService } from './pull-requests.service';
import { EMPTY, Observable } from 'rxjs';
import { PullRequest } from '@tskmgr/common';
import { ColDef, GridOptions, GridReadyEvent } from 'ag-grid-community';
import { RunsCellRendererComponent } from './cell-renderers/runs-cell-renderer.component';
import { defaultGridOptions, urlCellRenderer, dateValueFormatter } from '../common/ag-grid.util';

@Component({
  selector: 'tskmgr-pull-requests',
  template: `
    <ag-grid-angular class="ag-theme-alpine" [rowData]="pullRequests$ | async" [columnDefs]="columnDefs" [gridOptions]="gridOptions">
    </ag-grid-angular>
  `,
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
export class PullRequestsComponent implements OnInit {
  constructor(private readonly pullRequestsService: PullRequestsService) {}

  pullRequests$: Observable<PullRequest[]> = EMPTY;

  gridOptions: GridOptions = {
    ...defaultGridOptions,

    onGridReady(event: GridReadyEvent) {
      event.api.sizeColumnsToFit();
    },
  };

  columnDefs: ColDef[] = [
    { field: '_id', headerName: 'Id' },
    { field: 'name', cellRenderer: urlCellRenderer },
    { field: 'createdAt', valueFormatter: dateValueFormatter },
    { field: 'updatedAt', valueFormatter: dateValueFormatter },
    { field: 'runs', cellRenderer: RunsCellRendererComponent, autoHeight: true },
  ];

  ngOnInit(): void {
    this.pullRequests$ = this.pullRequestsService.findAll();
  }
}
