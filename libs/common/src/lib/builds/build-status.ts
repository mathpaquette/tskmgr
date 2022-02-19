export enum BuildStatus {
  Created = 'CREATED', // newly created build without tasks
  Started = 'STARTED', // tasks have been added, ready to pick up
  Closed = 'CLOSED', // all tasks created, waiting for completion
  Aborted = 'ABORTED', // one task failed
  Completed = 'COMPLETED', // all tasks completed successfully
}
