import { AppDataSource } from '../lib/data-source';

describe('data-source', () => {
  it('should have migrations', () => {
    const dataSource = AppDataSource;
    expect(dataSource.options.migrations[0]).toContain('libs/db/src/migrations/*.js');
  });
});
