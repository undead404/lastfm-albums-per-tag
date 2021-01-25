import { configure } from 'log4js';
import parameters from './parameters';

const environment =
  process.env.NODE_ENV === undefined ? 'development' : process.env.NODE_ENV;

const log4js = configure({
  appenders: {
    toFile: {
      type: 'file',
      filename: `logs/${environment}.log`,
      maxLogSize: 10485760,
      backups: 3,
      keepFileExt: true,
    },
    toConsole: {
      type: 'console',
    },
  },
  categories: {
    default: {
      appenders:
        environment === 'production' ? ['toConsole'] : ['toConsole', 'toFile'],
      level:
        parameters.logLevel ||
        (environment === 'production' ? 'info' : 'debug'),
    },
  },
});
const logger = log4js.getLogger();
export default logger;
