import { Component, HostListener, OnDestroy, inject } from '@angular/core';
import { AgGridEvent, ColDef, GridApi, GridOptions, GridReadyEvent } from 'ag-grid-community';
import { dateValueFormatter, defaultGridOptions } from '../../common/ag-grid.utils';
import { RunDetailsService } from './run-details.service';
import { Subject, takeUntil } from 'rxjs';
import { File } from '@tskmgr/common';
import { FileIdCellRendererComponent } from '../cell-renderers/file-id-cell-renderer.component';
import { themeAlpine } from 'ag-grid-community';

@Component({
  standalone: false,
  template: `
    <div class="d-flex flex-column w-100">
      <div class="d-flex flex-row justify-content-end m-2">
        <!-- PLACEHOLDER -->
      </div>

      <div class="d-flex h-100">
        <ag-grid-angular [columnDefs]="columnDefs" [gridOptions]="gridOptions" [theme]="theme"></ag-grid-angular>
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
  private readonly runDetailsService = inject(RunDetailsService);

  readonly theme = themeAlpine;

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
  };

  readonly destroy$ = new Subject<void>();

  private api!: GridApi;

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.api?.sizeColumnsToFit();
  }

  onGridReady(event: GridReadyEvent): void {
    this.api = event.api;
    this.runDetailsService.files$.pipe(takeUntil(this.destroy$)).subscribe((x) => {
      this.refreshData(x, event);
    });

    event.api.sizeColumnsToFit();
  }

  refreshData(files: File[], event: AgGridEvent): void {
    event.api.updateGridOptions({ rowData: files });
  }
}
