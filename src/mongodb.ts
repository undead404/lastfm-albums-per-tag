import { differenceInDays, parseISO } from 'date-fns';
import head from 'lodash/head';
import { Collection, MongoClient, UpdateWriteOpResult } from 'mongodb';
import { Cached } from './types';
import {
  MAX_CACHE_AGE_IN_DAYS,
  MONGO_DB_NAME,
  MONGO_DB_URL,
} from './constants';
import { isEmpty } from 'lodash';

const client = new MongoClient(MONGO_DB_URL);

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
      await client.db(MONGO_DB_NAME).command({ ping: 1 });
      collection = client.db(MONGO_DB_NAME).collection('cache');
      return collection;
    },
  };
})();

export function close(): Promise<void> {
  return connection.close();
}

function validateCache(cacheItem: any) {
  if(!cacheItem) {
    return false;
  }
  if(!cacheItem.data?.updatedAt) {
    return false;
  }
  if (
    cacheItem.data.updatedAt &&
    differenceInDays(parseISO(cacheItem.data.updatedAt), new Date()) >
      MAX_CACHE_AGE_IN_DAYS
  ) {
    return false;
  }
  if( cacheItem.album && (isEmpty(cacheItem.album.tags?.tag) || !(cacheItem.album.wiki.published))) {
    return false;
  }
  return true;
}

export async function getCache<T>(
  cachePath: string,
): Promise<Cached<T> | null> {
  const collection = await connection.getCollection();
  // eslint-disable-next-line unicorn/no-fn-reference-in-iterator
  const cacheItem = head(await collection.find({ cachePath }).toArray());
  if(!validateCache(cacheItem)) {
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
