import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

@Component({
  selector: 'tskmgr-run-cell-renderer',
  template: ` <a routerLink="/runs/{{ id }}/tasks">{{ id }}</a> `,
})
export class RunCellRendererComponent implements ICellRendererAngularComp {
  id: string;

  agInit(params: ICellRendererParams): void {
    this.id = params.value;
  }

  refresh(params: ICellRendererParams): boolean {
    return false;
  }
}
