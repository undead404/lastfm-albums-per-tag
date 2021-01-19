import head from 'lodash/head';
import isDate from 'lodash/isDate';
import isString from 'lodash/isString';
import split from 'lodash/split';
import { Collection, MongoClient, UpdateWriteOpResult } from 'mongodb';

import { differenceInDays, parseISO } from 'date-fns';
import { Cached, CacheItem } from './types';
import {
  MAX_CACHE_AGE_IN_DAYS_BY_DEFAULT,
  MAX_CACHE_AGE_IN_DAYS_FOR_TAG,
  MAX_CACHE_AGE_IN_DAYS_FOR_ALBUM,
  MAX_CACHE_AGE_IN_DAYS_FOR_ARTIST,
  MONGO_DB_NAME,
  MONGO_DB_URL,
} from './constants';

const client = new MongoClient(MONGO_DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

function getMaxCacheAgeInDays(cachePath: string): number {
  const entityName = head(split(cachePath, '.'));
  switch (entityName) {
    case 'tag':
      return MAX_CACHE_AGE_IN_DAYS_FOR_TAG;
    case 'album':
      return MAX_CACHE_AGE_IN_DAYS_FOR_ALBUM;
    case 'artist':
      return MAX_CACHE_AGE_IN_DAYS_FOR_ARTIST;
    default:
      return MAX_CACHE_AGE_IN_DAYS_BY_DEFAULT;
  }
}

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

export default connection;

function validateCache<T1, T2 extends CacheItem<T1>>(
  cachePath: string,
  cacheItem: T2,
) {
  if (!cacheItem) {
    return false;
  }
  if (!cacheItem.data?.updatedAt) {
    return false;
  }
  let updatedAt: Date;
  if (isDate(cacheItem.data.updatedAt)) {
    updatedAt = cacheItem.data.updatedAt;
  } else if (isString(cacheItem.data.updatedAt)) {
    updatedAt = parseISO(cacheItem.data.updatedAt);
  } else {
    return false;
  }
  if (
    differenceInDays(updatedAt, new Date()) > getMaxCacheAgeInDays(cachePath)
  ) {
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
  if (!validateCache(cachePath, cacheItem)) {
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
