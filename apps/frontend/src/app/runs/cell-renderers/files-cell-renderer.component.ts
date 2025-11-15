import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { File } from '@tskmgr/common';

@Component({
  standalone: false,
  selector: 'tskmgr-files-cell-renderer',
  template: `
    @for (file of files; track file; let i = $index) {
      <a routerLink="." [queryParams]="{ fileId: file.id }">
        <i class="bi bi-file-text" placement="top" ngbTooltip="{{ file.originName }}" container="body"></i>
      </a>
    }
  `,
})
export class FilesCellRendererComponent implements ICellRendererAngularComp {
  files: File[];

  agInit(params: ICellRendererParams): void {
    this.files = params.value;
  }

  refresh(params: ICellRendererParams): boolean {
    return false;
  }
}
