import { Component, Input } from '@angular/core';
import { AnsiUp } from 'ansi_up';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { TaskLogFileService } from './task-log-file.service';
import { catchError, map, Observable, of } from 'rxjs';
import { AsyncPipe, NgIf } from '@angular/common';

@Component({
  selector: 'tskmgr-run-details-task-log',
  standalone: true,
  template: `
    <div class="overflow-auto p-3" *ngIf="taskLogHtml$ | async as taskLogHtml; else spinner" style="min-height: 100vh">
      <div [innerHTML]="taskLogHtml"></div>
    </div>
    <ng-template #spinner>
      <div class="d-flex justify-content-center align-items-center" style="min-height: 100vh">
        <div class="spinner-border" role="status" style="width: 4rem; height: 4rem;">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
    </ng-template>
  `,
  imports: [AsyncPipe, NgIf],
  styles: [],
})
export class RunDetailsTaskLogComponent {
  @Input() set logFileId(fileId: string) {
    this._logFileId = fileId;
    if (this._logFileId) {
      this.getTaskLog(fileId);
    }
  }
  get logFileId(): string {
    return this._logFileId;
  }
  private _logFileId: string;

  taskLogHtml$: Observable<SafeHtml>;

  constructor(private sanitizer: DomSanitizer, private taskLogFileService: TaskLogFileService) {}

  private convertAnsiToHtml(ansiText: string): SafeHtml {
    const ansiConverter = new AnsiUp();
    const rawHtml = ansiConverter
      .ansi_to_html(ansiText)
      .split('\n')
      .map((line) => `<div><pre class="m-0" style="white-space: pre-wrap">${line}</pre></div>`)
      .join('\n');
    return this.sanitizer.bypassSecurityTrustHtml(rawHtml);
  }

  private getTaskLog(fileId: string): void {
    this.taskLogHtml$ = this.taskLogFileService.getTaskLogFile(fileId).pipe(
      map((log) => this.convertAnsiToHtml(log)),
      catchError(() =>
        of(
          this.sanitizer.bypassSecurityTrustHtml(
            '<div class="d-grid justify-content-center fs-2">Log file not found</div>'
          )
        )
      )
    );
  }
}
