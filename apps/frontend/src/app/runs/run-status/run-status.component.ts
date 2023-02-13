import { Component, Input } from '@angular/core';
import { Run, RunStatus } from '@tskmgr/common';

@Component({
  selector: 'tskmgr-run-status',
  template: `
    <span *ngIf="run?.status === statusEnum.Created" class="badge bg-secondary">CREATED</span>
    <span *ngIf="run?.status === statusEnum.Started" class="badge bg-secondary">STARTED</span>

    <span *ngIf="run?.status === statusEnum.Completed" class="badge bg-success">COMPLETED</span>

    <span *ngIf="run?.status === statusEnum.Failed" class="badge bg-danger">FAILED</span>
    <span *ngIf="run?.status === statusEnum.Aborted" class="badge bg-danger">ABORTED</span>
  `,
  styles: [],
})
export class RunStatusComponent {
  statusEnum = RunStatus;

  @Input() run: Run | null;
}
