import axios from 'axios';
import isEmpty from 'lodash/isEmpty';
import { stringify } from 'query-string';

import { DEFAULT_PARAMS, MAX_RETRIES } from '../constants';
import logger from '../logger';
import { getCache, setCache } from '../mongodb';
import { Cached, Parameters, Payload } from '../types';
import sleep from './sleep';

async function getFromApi<T extends Payload>(
    parameters: Parameters,
    cachePath: string,
    correctCachePath: (payload: T) => string,
    retry = 0,
): Promise<T | null> {
    const url = `https://ws.audioscrobbler.com/2.0/?${stringify({
        ...DEFAULT_PARAMS,
        ...parameters,
    })}`;
    logger.debug(url);
    try {
        const response = await axios.get<T>(url);
        if (response.data.error || isEmpty(response.data)) {
            if (response.data.error === 6) {
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
        await sleep(2 ** retry * 1000);
        return getFromApi<T>(
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
    logger.debug(cachePath);
    return (
        (await getCache(cachePath)) ||
        getFromApi(parameters, cachePath, correctCachePath)
    );
}
