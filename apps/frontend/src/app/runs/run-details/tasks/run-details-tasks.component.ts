import { Component, OnInit } from '@angular/core';
import { RunDetailsService } from '../run-details.service';
import { Run } from '@tskmgr/common';
import { ColDef } from 'ag-grid-community';
import { RunCellRendererComponent } from '../../cell-renderers/run-cell-renderer.component';
import { checkboxCellRenderer, durationValueFormatter, urlCellRenderer } from '../../../common/ag-grid.util';

@Component({
  template: `
    <ag-grid-angular class="ag-theme-alpine" [columnDefs]="columnDefs" [gridOptions]="gridOptions"> </ag-grid-angular>
  `,
})
export class RunDetailsTasksComponent implements OnInit {
  run: Run | null;

  readonly columnDefs: ColDef[] = [
    { field: 'id' },
    { field: 'name' },
    { field: 'type' },
    { field: 'status' },
    { field: 'prioritization' },
    { field: 'affinity' },
    { field: 'failFast' },
    { field: 'closed' },
    { field: 'duration', headerName: 'Duration (sec)' },
  ];

  readonly gridOptions = {};

  constructor(private readonly runDetailsService: RunDetailsService) {}

  ngOnInit(): void {
    this.runDetailsService.run$.subscribe((x) => (this.run = x));
  }
}
