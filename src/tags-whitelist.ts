import { readFile } from 'fs-extra';
import includes from 'lodash/includes';
import split from 'lodash/split';
import toLower from 'lodash/toLower';
import logger from './logger';

let whitelistedTags: string[] | undefined;

export async function initWhitelistedTags(): Promise<void> {
  logger.debug('initWhitelistedTags()');
  whitelistedTags = split((await readFile('tags.txt')).toString(), '\r\n');
}

export default function isTagWhitelisted(tagName: string): boolean {
  return includes(whitelistedTags, toLower(tagName));
}
