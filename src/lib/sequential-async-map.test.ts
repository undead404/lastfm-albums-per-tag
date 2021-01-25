import sequentialAsyncMap from './sequential-async-map';

function square(item: number): Promise<number> {
  return Promise.resolve(item * item);
}

describe('sequentialAsyncMap', () => {
  it('succeeds on an empty array', async () => {
    const f = jest.fn();
    await sequentialAsyncMap([], f);
    expect(f).toHaveBeenCalledTimes(0);
  });
  it('succeeds on an array with only one element', async () => {
    const result = await sequentialAsyncMap([0], square);
    expect(result).toEqual([0]);
  });
  it('succeeds on an array with three elements', async () => {
    const result = await sequentialAsyncMap([0, 1, 2], square);
    expect(result).toEqual([0, 1, 4]);
  });
});
