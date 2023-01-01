import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { Task } from '@tskmgr/common';

@Component({
  selector: 'tskmgr-task-id-cell-renderer',
  template: `
    <ng-template [ngIf]="id">
      <a href="/api/files/1">{{ id }}</a>
    </ng-template>
    <ng-template [ngIf]="!id">{{ value }}</ng-template>
  `,
})
export class TaskIdCellRendererComponent implements ICellRendererAngularComp {
  id: number | undefined;
  value: string;

  agInit(params: ICellRendererParams): void {
    this.value = params.value;
    const task: Task = params.data;
    this.id = task.files.find((x) => x.type === 'log')?.id;
  }

  refresh(params: ICellRendererParams): boolean {
    return false;
  }
}
