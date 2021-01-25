// import { hideBin } from 'yargs/helpers';
import yargs from 'yargs';

// eslint-disable-next-line no-magic-numbers
export default yargs(process.argv.slice(2))
  .option('limit', {
    alias: 'l',
    describe: 'Limit to output albums',
    type: 'number',
  })
  .option('maxPage', {
    alias: 'p',
    default: 1,
    describe: 'Pages to scrape, max 200',
    type: 'number',
  })
  .option('tagName', {
    alias: 't',
    demandOption: true,
    describe: 'tag to scrape',
    type: 'string',
  })
  .option('logLevel', {
    alias: 'll',
    default: 'info',
    describe: 'log level',
    type: 'string',
  }).argv;
