import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Logger } from '@nestjs/common';

@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = performance.now(); // Start time

    return next.handle().pipe(
      tap(() => {
        const end = performance.now(); // End time
        const executionTime = (end - now).toFixed(2);

        const request = context.switchToHttp().getRequest();
        Logger.debug(`[${request.method}] ${request.url} executed in ${executionTime} ms`);
      })
    );
  }
}
