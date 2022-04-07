export enum RunStatus {
  Created = 'CREATED', // newly created run without tasks
  Started = 'STARTED', // tasks have been added, ready to pick up
  Closed = 'CLOSED', // all tasks created, waiting for completion
  Aborted = 'ABORTED', // stopped by user
  Failed = 'FAILED', // one task failed
  Completed = 'COMPLETED', // all tasks completed successfully
}
