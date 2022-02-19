/* eslint-disable @typescript-eslint/no-empty-function */

import { Client } from './client';
import { ApiUrl, Task } from '@tskmgr/common';

export class ClientFactory {
  public static createNew(
    baseUrl: string, //
    runnerId: string,
    parallel = 1,
    dataCallback: (task: Task, data: any, cached: () => void) => void = () => {},
    errorCallback: (task: Task, data: any) => void = () => {},
    pollingDelayMs = 2500,
    retryDelayMs = 5000,
    retryCount = 2
  ): Client {
    return new Client(
      ApiUrl.create(baseUrl), //
      runnerId,
      parallel,
      dataCallback,
      errorCallback,
      pollingDelayMs,
      retryDelayMs,
      retryCount
    );
  }
}
