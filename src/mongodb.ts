import { differenceInDays } from 'date-fns';
import head from 'lodash/head';
import { Collection, MongoClient, UpdateWriteOpResult } from 'mongodb';
import Cached from './types/cached';

const url = 'mongodb://localhost:27017';
const MAX_CACHE_AGE_IN_DAYS = 7;
// Database Name
const databaseName = 'lastfm';

const client = new MongoClient(url);

const connection = (() => {
  let collection: Collection | undefined;
  return {
    async close() {
      collection = undefined;
      return client.close();
    },
    getCollection: async () => {
      if (collection) {
        return collection;
      }
      await client.connect();
      // Establish and verify connection
      await client.db(databaseName).command({ ping: 1 });
      collection = client.db(databaseName).collection('cache');
      return collection;
    },
  };
})();

export function close(): Promise<void> {
  return connection.close();
}

export async function getCache<T>(
  cachePath: string,
): Promise<Cached<T> | null> {
  const collection = await connection.getCollection();
  // eslint-disable-next-line unicorn/no-fn-reference-in-iterator
  const cacheItem = head(await collection.find({ cachePath }).toArray());
  if (!cacheItem) {
    return null;
  }
  if (
    cacheItem.data.updatedAt &&
    differenceInDays(cacheItem.data.updatedAt as Date, new Date()) >
      MAX_CACHE_AGE_IN_DAYS
  ) {
    return null;
  }
  // logger.debug(cacheItem);
  return cacheItem.data;
}

export async function setCache<T>(
  cachePath: string,
  data: T,
): Promise<UpdateWriteOpResult> {
  const collection = await connection.getCollection();
  return collection.updateOne(
    { cachePath },
    { $set: { data } },
    { upsert: true },
  );
}
