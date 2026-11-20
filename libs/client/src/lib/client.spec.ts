// @vitest-environment node

import { Client } from './client';
import { ClientFactory } from './client-factory';

describe('client', () => {
  let client: Client;

  beforeEach(() => {
    client = ClientFactory.createNew('http://localhost:3000', 'runner-1');
  });

  afterEach(() => {
    vi.useRealTimers();
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

  it('keeps headers and redirect settings scoped to each client', async () => {
    const requests: Request[] = [];
    vi.spyOn(global, 'fetch').mockImplementation(async (input, init) => {
      requests.push(new Request(input, init));
      return Response.json({});
    });
    const firstClient = ClientFactory.createNew('http://localhost:3000', 'runner-1', {
      headers: { Authorization: 'Bearer first', 'Content-Type': 'application/custom+json' },
    });
    const secondClient = ClientFactory.createNew('http://localhost:3000', 'runner-2', {
      headers: () => new Headers({ Authorization: 'Bearer second' }),
    });

    await firstClient.closeRun(1);
    await secondClient.closeRun(1);
    await client.closeRun(1);

    expect(
      requests.map(({ headers, redirect }) => [headers.get('Authorization'), headers.get('Content-Type'), redirect]),
    ).toEqual([
      ['Bearer first', 'application/custom+json', 'error'],
      ['Bearer second', 'application/json', 'error'],
      [null, 'application/json', 'follow'],
    ]);
  });

  it('resolves async headers again on retry', async () => {
    vi.useFakeTimers();
    const headers = vi
      .fn<() => Promise<HeadersInit>>()
      .mockResolvedValueOnce({ Authorization: 'Bearer first' })
      .mockResolvedValueOnce({ Authorization: 'Bearer next' });
    const authorization: (string | null)[] = [];
    const fetchMock = vi
      .spyOn(global, 'fetch')
      .mockImplementationOnce(async (input, init) => {
        authorization.push(new Request(input, init).headers.get('Authorization'));
        return new Response(null, { status: 503 });
      })
      .mockImplementationOnce(async (input, init) => {
        authorization.push(new Request(input, init).headers.get('Authorization'));
        return Response.json({});
      });
    const retryClient = ClientFactory.createNew('http://localhost:3000', 'runner-1', { headers });

    const task = retryClient.startTask(1, { runnerId: 'runner-1' });
    const result = expect(task).resolves.toEqual({});
    await vi.runAllTimersAsync();
    await result;

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(headers).toHaveBeenCalledTimes(2);
    expect(authorization).toEqual(['Bearer first', 'Bearer next']);
  });

  it('sends no request when the header provider fails', async () => {
    vi.useFakeTimers();
    const fetchMock = vi.spyOn(global, 'fetch').mockResolvedValue(Response.json({}));
    const error = new Error('Token unavailable');
    const failingClient = ClientFactory.createNew('http://localhost:3000', 'runner-1', {
      headers: () => {
        throw error;
      },
    });

    const task = failingClient.startTask(1, { runnerId: 'runner-1' });
    const result = expect(task).rejects.toBe(error);
    await Promise.all([result, vi.runAllTimersAsync()]);

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each(['uploadRunFile', 'uploadTaskFile'] as const)(
    'sends custom headers and a generated multipart boundary for %s',
    async (upload) => {
      const headers = { 'X-Api-Key': 'test', 'content-type': 'application/json' };
      const uploadClient = ClientFactory.createNew('http://localhost:3000', 'runner-1', { headers });
      const fetchMock = vi.spyOn(global, 'fetch').mockResolvedValue(Response.json({}));

      await uploadClient[upload](1, './README.md', { type: 'log' });

      expect(fetchMock).toHaveBeenCalledTimes(1);
      const [input, init] = fetchMock.mock.calls[0];
      const request = new Request(input, init);
      expect(request.headers.get('X-Api-Key')).toBe('test');
      expect(request.headers.get('Content-Type')).toMatch(/^multipart\/form-data; boundary=.+/);
      expect((await request.formData()).get('type')).toBe('log');
      expect(headers).toEqual({ 'X-Api-Key': 'test', 'content-type': 'application/json' });
    },
  );
});
