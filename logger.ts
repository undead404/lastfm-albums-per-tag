import log4js from 'log4js';

const appenders = ['toConsole'];
if (process.env.NODE_ENV !== 'production') {
    appenders.push('toFile');
}
log4js.configure({
    appenders: {
        toFile: {
            type: 'file',
            filename: `logs/${process.env.NODE_ENV || 'development'}.log`,
            maxLogSize: 10485760,
            backups: 3,
            keepFileExt: true,
        },
        toConsole: {
            type: 'console',
        },
    },
    categories: {
        default: { appenders, level: 'debug' },
    },
});
const logger = log4js.getLogger();
logger.level = process.env.NODE_ENV === 'production' ? 'info' : 'debug';
export default logger;