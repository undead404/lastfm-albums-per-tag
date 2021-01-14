import reduce from 'lodash/reduce';

export default async function sequentialAsyncMap<T1, T2>(
  collection: readonly T1[],
  f: (item: T1) => Promise<T2>,
): Promise<readonly T2[]> {
  return reduce(
    collection,
    async (accumulator, item) => [...(await accumulator), await f(item)],
    Promise.resolve([] as readonly T2[]),
  );
}
