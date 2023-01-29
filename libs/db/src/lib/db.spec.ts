import { db } from './db';

describe('db', () => {
  it('should work', () => {
    expect(db()).toEqual('db');
  });
});
