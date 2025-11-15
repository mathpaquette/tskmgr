import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TaskLogFileService {
  private readonly http = inject(HttpClient);

  getTaskLogFile(fileId: string): Observable<string> {
    const url = `/api/files/${fileId}`;
    return this.http.get(url, { responseType: 'text' });
  }
}
