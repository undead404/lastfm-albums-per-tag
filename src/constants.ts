import isNil from 'lodash/isNil';

import environment from './environment';
import logger from './logger';
import { DefaultParameters } from './types';

const { LASTFM_API_KEY } = environment;
if (isNil(LASTFM_API_KEY)) {
  logger.error(new Error('No API key supplied'));
  process.exit(1);
}

export const DEFAULT_PARAMS: DefaultParameters = {
  api_key: LASTFM_API_KEY,
  autocorrect: '1',
  format: 'json',
};

export const LASTFM_API_ERRORS = {
  AUTH_FAILED: 4,
  INVALID_API_KEY: 10,
  INVALID_FORMAT: 5,
  INVALID_METHOD: 3,
  INVALID_METHOD_SIGNATURE: 13,
  INVALID_PARAMETERS: 6,
  INVALID_RESOURCE: 7,
  INVALID_SERVICE: 2,
  OPERATION_FAILED: 8,
  RATE_LIMIT_EXCEEDED: 29,
  SERVICE_OFFLINE: 11,
  SUSPENDED_API_KEY: 26,
  TEMPORARY: 16,
};

export const MAX_CACHE_AGE_IN_DAYS_BY_DEFAULT = 7;
export const MAX_CACHE_AGE_IN_DAYS_FOR_ALBUM = 180;
export const MAX_CACHE_AGE_IN_DAYS_FOR_ARTIST = 31;
export const MAX_CACHE_AGE_IN_DAYS_FOR_TAG = 7;
export const MAX_RETRIES = 3;
export const MONGO_DB_URL = 'mongodb://localhost:27017';
export const MONGO_DB_NAME = 'lastfm';
export const NUMBER_OF_ALBUMS_TO_SHOW = 100;
