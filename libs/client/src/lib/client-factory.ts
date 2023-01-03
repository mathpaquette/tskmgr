import { Client } from './client';
import { ClientOptions } from './client-options';
import { ApiUrl } from '@tskmgr/common';

export class ClientFactory {
  public static createNew(
    baseUrl: string, //
    runnerId: string,
    options?: ClientOptions
  ): Client {
    return new Client(
      ApiUrl.create(baseUrl), //
      runnerId,
      { ...Client.DefaultOptions, ...options }
    );
  }
}
