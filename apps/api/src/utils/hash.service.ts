import { Injectable } from '@nestjs/common';
import { createHash } from 'node:crypto';

@Injectable()
export class HashService {
  /**
   * Generates a SHA-256 hash for a given object.
   * @param object The object to hash.
   * @returns The base64-encoded hash of the object.
   */
  public generateHash(object: object): string {
    return createHash('sha256').update(JSON.stringify(object)).digest('base64');
  }
}
