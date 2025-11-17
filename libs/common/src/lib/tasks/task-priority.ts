export enum TaskPriority {
  Newest = 'NEWEST', // FIFO
  Oldest = 'OLDEST', // LIFO
  Longest = 'LONGEST', // Average duration DESC
  Shortest = 'SHORTEST', // Average duration ASC
}
