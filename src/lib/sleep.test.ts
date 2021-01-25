import sleep from './sleep';

describe('sleep', () => {
  it('waits no less than expected', async () => {
    const start = new Date().getTime();
    await sleep(500);
    expect(new Date().getTime() - start).toBeGreaterThanOrEqual(500);
  });
});
