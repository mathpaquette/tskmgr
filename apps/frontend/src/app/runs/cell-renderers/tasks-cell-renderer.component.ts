import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

@Component({
  selector: 'tskmgr-runs-cell-renderer',
  template: ` <a routerLink="/runs/{{ id }}/tasks">tasks</a> `,
})
export class TasksCellRendererComponent implements ICellRendererAngularComp {
  id: string;

  agInit(params: ICellRendererParams): void {
    this.id = params.value;
  }

  refresh(params: ICellRendererParams): boolean {
    return false;
  }
}
