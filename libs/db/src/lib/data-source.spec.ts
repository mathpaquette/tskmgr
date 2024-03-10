import { AppDataSource } from '../lib/data-source';
import * as path from 'path';

describe('data-source', () => {
  it('should have migrations', () => {
    const dataSource = AppDataSource;
    const expectedPath = path.join(__dirname, '..', 'migrations', '*.js');
    expect(dataSource.options.migrations[0]).toEqual(expectedPath);
  });
});
