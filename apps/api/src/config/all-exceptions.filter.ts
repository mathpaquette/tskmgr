import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { isObject } from '@nestjs/common/utils/shared.utils';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private static readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    // In certain situations `httpAdapter` might not be available in the
    // constructor method, thus we should resolve it here.
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();

    const httpStatus = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const responseBody = {
      statusCode: httpStatus,
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(ctx.getRequest()),
      message: this.getErrorMessage(exception),
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }

  getErrorMessage(exception: any): string {
    if (this.isExceptionObject(exception)) {
      AllExceptionsFilter.logger.error(exception.message, exception.stack);
      return exception.message;
    } else {
      AllExceptionsFilter.logger.error(exception);
      return 'Internal server error';
    }
  }

  isExceptionObject(err: any): err is Error {
    return isObject(err) && !!(err as Error).message;
  }
}
