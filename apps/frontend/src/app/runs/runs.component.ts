import { Component } from '@angular/core';
import { EMPTY, Observable } from 'rxjs';
import { Run } from '@tskmgr/common';
import { RunsService } from './runs.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ColDef, GridOptions, GridReadyEvent, RowDoubleClickedEvent, RowNode } from 'ag-grid-community';
import { TasksCellRendererComponent } from './cell-renderers/tasks-cell-renderer.component';
import { defaultGridOptions, durationValueFormatter, timeValueFormatter, urlCellRenderer } from '../common/ag-grid.util';

@Component({
  selector: 'tskmgr-runs',
  template: `
    <ag-grid-angular
      class="ag-theme-alpine"
      [rowData]="runs$ | async"
      [columnDefs]="columnDefs"
      [gridOptions]="gridOptions"
    ></ag-grid-angular>
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
export class RunsComponent {
  constructor(
    private readonly runsService: RunsService, //
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {}

  runs$: Observable<Run[]> = EMPTY;
  id = '';

  gridOptions: GridOptions = {
    ...defaultGridOptions,

    onGridReady: this.onGridReady.bind(this),
    onRowDoubleClicked: this.onRowDoubleClicked.bind(this),
    getRowNodeId: (data) => data._id,
    getRowClass: (params) => (params.data._id === this.id ? 'highlight-row' : undefined),
  };

  columnDefs: ColDef[] = [
    { field: '_id', headerName: 'Id' },
    { field: 'name', cellRenderer: urlCellRenderer },
    { field: 'type' },
    { field: 'runners' },
    { field: 'leaderId' },
    { field: 'createdAt', valueFormatter: timeValueFormatter },
    { field: 'updatedAt', valueFormatter: timeValueFormatter },
    { field: 'endedAt', valueFormatter: timeValueFormatter },
    { field: 'duration', valueFormatter: durationValueFormatter },
    { field: 'status' },
    { field: '_id', headerName: 'Tasks', cellRenderer: TasksCellRendererComponent },
  ];

  ngOnInit(): void {
    this.runs$ = this.runsService.findAll();
    this.id = this.activatedRoute.snapshot.params['id'];
  }

  onGridReady(event: GridReadyEvent): void {
    event.api.sizeColumnsToFit();
  }

  onRowDoubleClicked(event: RowDoubleClickedEvent): void {
    const previousNode = event.api.getRowNode(this.id);
    if (previousNode === event.node) return;

    this.id = event.data._id;
    this.router.navigate(['runs', this.id]);

    event.api.redrawRows({ rowNodes: [previousNode as RowNode, event.node] });
  }
}
