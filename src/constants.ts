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

export const MAX_RETRIES = 5;
