import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

@Component({
  standalone: false,
  selector: 'tskmgr-file-id-cell-renderer',
  template: ` <a href="/api/files/{{ id }}" target="_blank">{{ id }}</a> `,
})
export class FileIdCellRendererComponent implements ICellRendererAngularComp {
  id: string;

  agInit(params: ICellRendererParams): void {
    this.id = params.value;
  }

  refresh(params: ICellRendererParams): boolean {
    return false;
  }
}
