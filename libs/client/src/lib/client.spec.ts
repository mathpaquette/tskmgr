import { Client } from './client';
import { ClientFactory } from './client-factory';

describe('client', () => {
  let client: Client;

  beforeEach(() => {
    client = ClientFactory.createNew('http://localhost:3000', 'runner-1');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should retry when rejected promise', async () => {
    // arrange
    vi.spyOn(global, 'fetch')
      .mockRejectedValueOnce(new Error())
      .mockResolvedValue({ ok: true, json: async () => ({}) } as Response);
    // act
    await client.uploadRunFile(1, './README.md', {});
    // assert
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it('should retry when fetch response not ok', async () => {
    // arrange
    vi.spyOn(global, 'fetch')
      .mockResolvedValueOnce({ ok: false, statusText: 'Internal Server Error' } as Response)
      .mockResolvedValue({ ok: true, json: async () => ({}) } as Response);
    // act
    await client.uploadRunFile(1, './README.md', {});
    // assert
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });
});
