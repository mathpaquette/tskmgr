import { Component, OnInit } from '@angular/core';
import { RunsService } from '../runs.service';
import { ActivatedRoute } from '@angular/router';
import { EMPTY, Observable } from 'rxjs';
import { Task } from '@tskmgr/common';
import { ColDef, GridOptions, GridReadyEvent } from 'ag-grid-community';
import { format } from 'date-fns';
import { defaultGridOptions, valueFormatterDuration, valueFormatterTime } from '../../common/ag-grid.util';

@Component({
  selector: 'tskmgr-tasks',
  template: `
    <ag-grid-angular class="ag-theme-alpine" [rowData]="tasks$ | async" [columnDefs]="columnDefs" [gridOptions]="gridOptions">
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
export class TasksComponent implements OnInit {
  constructor(private readonly runsService: RunsService, private activatedRoute: ActivatedRoute) {}

  id = '';
  tasks$: Observable<Task[]> = EMPTY;

  gridOptions: GridOptions = {
    ...defaultGridOptions,

    onGridReady(event: GridReadyEvent) {
      event.api.sizeColumnsToFit();
    },
  };

  columnDefs: ColDef[] = [
    { field: '_id', headerName: 'Id' },
    { field: 'name' },
    { field: 'type' },

    { field: 'command' },
    { field: 'arguments', valueFormatter: (params) => JSON.stringify(params.value) },
    { field: 'options', valueFormatter: (params) => JSON.stringify(params.value) },

    { field: 'runnerId' },
    { field: 'runnerHost' },

    { field: 'createdAt', valueFormatter: valueFormatterTime },
    { field: 'startedAt', valueFormatter: valueFormatterTime },
    { field: 'updatedAt', valueFormatter: valueFormatterTime },
    { field: 'endedAt', valueFormatter: valueFormatterTime },

    { field: 'duration', valueFormatter: valueFormatterDuration },
    { field: 'avgDuration', valueFormatter: valueFormatterDuration },

    { field: 'status' },
  ];

  ngOnInit(): void {
    this.id = this.activatedRoute.snapshot.params['id'];
    this.tasks$ = this.runsService.findTasks(this.id);
  }
}
