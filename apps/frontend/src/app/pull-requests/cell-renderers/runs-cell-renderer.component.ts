import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { Run } from '@tskmgr/common';

@Component({
  selector: 'tskmgr-runs-cell-renderer',
  template: `
    <ul style="list-style: none; padding: 0; margin: 0">
      <li *ngFor="let run of runs">
        <a routerLink="/runs/{{ run._id }}">{{ run.name }}</a>
      </li>
    </ul>
  `,
})
export class RunsCellRendererComponent implements ICellRendererAngularComp {
  runs: Run[];

  agInit(params: ICellRendererParams): void {
    this.runs = params.value;
  }

  refresh(params: ICellRendererParams): boolean {
    return false;
  }
}
