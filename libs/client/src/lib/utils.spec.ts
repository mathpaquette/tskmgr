import { spawnAsync } from './utils';

describe('Utils', () => {
  it('should call dataHandler', async () => {
    // arrange
    const dataHandler = vi.fn();
    const errorHandler = vi.fn();
    // act
    await expect(
      spawnAsync(
        process.execPath,
        ['-e', 'console.log("some data"); process.exit(0)'],
        {},
        { dataHandler, errorHandler },
      ),
    ).resolves.toBeDefined();
    // assert
    expect(dataHandler).toHaveBeenCalledWith('some data');
    expect(errorHandler).not.toHaveBeenCalled();
  });

  it('should call errorHandler', async () => {
    // arrange
    const dataHandler = vi.fn();
    const errorHandler = vi.fn();
    // act
    await expect(
      spawnAsync(
        process.execPath,
        ['-e', 'console.error("some error"); process.exit(1)'],
        {},
        { dataHandler, errorHandler },
      ),
    ).rejects.toBeDefined();
    // assert
    expect(dataHandler).not.toHaveBeenCalled();
    expect(errorHandler).toHaveBeenCalledWith('some error');
  });
});
