import {Component, HostListener, OnDestroy} from '@angular/core';
import { EMPTY, Observable } from 'rxjs';
import { Run } from '@tskmgr/common';
import { RunsService } from './runs.service';
import { ActivatedRoute, Router } from '@angular/router';
import {
  ColDef,
  GridOptions,
  GridReadyEvent,
  RowClickedEvent,
  RowDoubleClickedEvent,
  RowNode,
} from 'ag-grid-community';
import {
  dateValueFormatter,
  defaultGridOptions,
  durationValueFormatter,
  urlCellRenderer,
} from '../common/ag-grid.util';

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
export class RunsComponent implements OnDestroy {
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
    getRowNodeId: (data) => data.id,
    onRowClicked: this.onRowClicked.bind(this),
    // getRowClass: (params) => (params.data._id === this.id ? 'highlight-row' : undefined),
  };

  columnDefs: ColDef[] = [
    { field: 'id' },
    { field: 'name', cellRenderer: urlCellRenderer },
    { field: 'type' },
    { field: 'status' },
    { field: 'duration', valueFormatter: durationValueFormatter },

    // { field: 'affinity', cellRenderer: checkboxCellRenderer },
    // { field: 'failFast', cellRenderer: checkboxCellRenderer },
    // { field: 'closed', cellRenderer: checkboxCellRenderer },
    // { field: 'leaderId' },
    // { field: 'prioritization' },
    { field: 'createdAt', valueFormatter: dateValueFormatter },
    { field: 'updatedAt', valueFormatter: dateValueFormatter },
    { field: 'endedAt', valueFormatter: dateValueFormatter },
    // { field: '_id', headerName: 'Tasks', cellRenderer: TasksCellRendererComponent },
  ];




  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    console.log(event.target.innerWidth);
    if (!this.gridOptions.api) return
    this.gridOptions.api.sizeColumnsToFit()
  }

  ngOnInit(): void {
    this.runs$ = this.runsService.findAll();
    this.id = this.activatedRoute.snapshot.params['id'];
  }

  ngOnDestroy() {
    console.log('desroyu')
  }

  onGridReady(event: GridReadyEvent): void {
    event.api.sizeColumnsToFit();
  }

  onRowClicked(event: RowClickedEvent): void {
    console.log('sd')
  }

  onRowDoubleClicked(event: RowDoubleClickedEvent): void {

    this.router.navigate(['runs', event.data.id]);

    // const previousNode = event.api.getRowNode(this.id);
    // if (previousNode === event.node) return;
    //
    // this.id = event.data._id;
    //
    //
    // event.api.redrawRows({ rowNodes: [previousNode as RowNode, event.node] });
  }
}
