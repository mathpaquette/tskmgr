import { Injectable } from '@nestjs/common';
import { createHash } from 'node:crypto';

@Injectable()
export class HashService {
  /**
   * Generates a SHA-256 hash for a given task.
   * @param task The task entity to hash.
   * @returns The base64-encoded hash of the task.
   */
  public generateHash(object: object): string {
    return createHash('sha256').update(JSON.stringify(object)).digest('base64');
  }
}
