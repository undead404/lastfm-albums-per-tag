import axios from 'axios';
import isEmpty from 'lodash/isEmpty';
import { stringify } from 'query-string';

import { DEFAULT_PARAMS, LASTFM_API_ERRORS, MAX_RETRIES } from '../constants';
import logger from '../logger';
import { getCache, setCache } from '../mongodb';
import { Cached, Parameters, Payload } from '../types';

import sleep from './sleep';

async function acquireFromApi<T extends Payload>(
  parameters: Parameters,
  cachePath: string,
  correctCachePath: (payload: T) => string,
  retry = 0,
): Promise<T | null> {
  const url = `https://ws.audioscrobbler.com/2.0/?${stringify({
    ...DEFAULT_PARAMS,
    ...parameters,
  })}`;
  logger.warn(url);
  try {
    const response = await axios.get<T>(url, { timeout: 2000 });
    if (response.data.error || isEmpty(response.data)) {
      if (response.data.error === LASTFM_API_ERRORS.INVALID_PARAMETERS) {
        return null;
      }
      throw new Error(response.data.message || 'Empty response');
    }
    const cachedData: Cached<T> = {
      ...response.data,
      updatedAt: new Date(),
    };
    void setCache(correctCachePath(cachedData), cachedData);
    logger.debug(cachedData);
    return cachedData;
  } catch (error) {
    logger.error(error);
    if (retry >= MAX_RETRIES) {
      throw error;
    }
    logger.warn(`retry #${retry + 1}`);
    // eslint-disable-next-line no-magic-numbers
    await sleep(2 ** retry * 1000);
    return acquireFromApi<T>(
      parameters,
      cachePath,
      correctCachePath,
      retry + 1,
    );
  }
}

export default async function acquire<T extends Payload>(
  parameters: Parameters,
  cachePath: string,
  correctCachePath: (payload: T) => string,
): Promise<T | null> {
  logger.info(cachePath);
  return (
    (await getCache(cachePath)) ||
    acquireFromApi(parameters, cachePath, correctCachePath)
  );
}
