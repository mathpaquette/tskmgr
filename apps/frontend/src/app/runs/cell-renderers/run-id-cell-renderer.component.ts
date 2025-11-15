import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

@Component({
  standalone: false,
  selector: 'tskmgr-run-id-cell-renderer',
  template: ` <a routerLink="/runs/{{ id }}/tasks">{{ id }}</a> `,
})
export class RunIdCellRendererComponent implements ICellRendererAngularComp {
  id: string;

  agInit(params: ICellRendererParams): void {
    this.id = params.value;
  }

  refresh(params: ICellRendererParams): boolean {
    return false;
  }
}
