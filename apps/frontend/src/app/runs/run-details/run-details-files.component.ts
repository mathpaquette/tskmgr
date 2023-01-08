import { Component, HostListener, OnDestroy } from '@angular/core';
import { AgGridEvent, ColDef, GridOptions, GridReadyEvent } from 'ag-grid-community';
import { dateValueFormatter, defaultGridOptions } from '../../common/ag-grid.util';
import { RunDetailsService } from './run-details.service';
import { Subject, takeUntil } from 'rxjs';
import { Run } from '@tskmgr/common';
import { FileIdCellRendererComponent } from '../cell-renderers/file-id-cell-renderer.component';

@Component({
  template: `
    <div class="d-flex flex-column w-100">
      <div class="d-flex flex-row justify-content-end m-2">
        <!-- PLACEHOLDER -->
      </div>

      <div class="d-flex h-100">
        <ag-grid-angular
          class="ag-theme-alpine"
          [columnDefs]="columnDefs"
          [gridOptions]="gridOptions"
        ></ag-grid-angular>
      </div>
    </div>
  `,
  selector: 'tskmgr-run-details-files',
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
export class RunDetailsFilesComponent implements OnDestroy {
  readonly columnDefs: ColDef[] = [
    { field: 'id', cellRenderer: FileIdCellRendererComponent },
    { field: 'description' },
    { field: 'type' },
    { field: 'originName' },
    { field: 'mimeType' },
    { field: 'task.id' },
    { field: 'createdAt', cellRenderer: dateValueFormatter },
  ];

  readonly gridOptions: GridOptions = {
    ...defaultGridOptions,
    onGridReady: this.onGridReady.bind(this),
    paginationAutoPageSize: true,
    pagination: true,
  };

  readonly destroy$ = new Subject<void>();

  constructor(private readonly runDetailsService: RunDetailsService) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.gridOptions.api?.sizeColumnsToFit();
  }

  onGridReady(event: GridReadyEvent): void {
    this.runDetailsService.run$.pipe(takeUntil(this.destroy$)).subscribe((x) => {
      this.refreshData(x, event);
    });
    event.api.sizeColumnsToFit();
  }

  refreshData(run: Run | undefined, event: AgGridEvent): void {
    if (!run) {
      return;
    }

    event.api.setRowData(run.files);
  }
}
