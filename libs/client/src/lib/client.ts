export function client(): string {
  return 'client';
}

import { spawn } from 'child_process';

export interface ProducerOptions {
  pullRequestId: string;
  buildId: string;
}

export interface ConsumerOptions {
}

export class Client {
  //constructor(private readonly options: ClientOptions) {}

  // public static create(options: ClientOptions): Client {
  //   return new Client(options);
  // }

  public createTasks(): Promise<> {

  }

  public executeTasks(): Promise<void> {
    const clients = [];

    for (let i = 0; i < this.options.size; i++) {
      spawn();
    }

    return Promise.all();
  }


}



async function defaultTaskRunner(): Promise<void> {
  let _continue = true;

  while (_continue) {



  }
}


// function executor(): Promise<void> {
//
//   return new Promise((resolve, reject) => {
//
//
//
//   })
//








}



