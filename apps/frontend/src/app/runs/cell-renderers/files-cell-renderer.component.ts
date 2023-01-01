import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { File } from '@tskmgr/common';

@Component({
  selector: 'tskmgr-files-cell-renderer',
  template: `
    <a *ngFor="let file of files; let i = index" href="/api/files/{{ file.id }}" target="_blank">
      <i class="bi bi-file-text" placement="top" ngbTooltip="{{ file.originName }}" container="body"></i>
    </a>
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
