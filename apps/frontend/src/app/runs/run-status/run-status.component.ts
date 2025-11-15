import { Component, Input } from '@angular/core';
import { Run, RunStatus } from '@tskmgr/common';

@Component({
  standalone: false,
  selector: 'tskmgr-run-status',
  template: `
    @if (run?.status === statusEnum.Created) {
      <span class="badge bg-secondary">CREATED</span>
    }
    @if (run?.status === statusEnum.Started) {
      <span class="badge bg-secondary">STARTED</span>
    }

    @if (run?.status === statusEnum.Completed) {
      <span class="badge bg-success">COMPLETED</span>
    }

    @if (run?.status === statusEnum.Failed) {
      <span class="badge bg-danger">FAILED</span>
    }
    @if (run?.status === statusEnum.Aborted) {
      <span class="badge bg-danger">ABORTED</span>
    }
  `,
  styles: [],
})
export class RunStatusComponent {
  statusEnum = RunStatus;

  @Input() run: Run | null;
}
