import isEmpty from 'lodash/isEmpty';
import join from 'lodash/join';
import toNumber from 'lodash/toNumber';
import toString from 'lodash/toString';
import uniqBy from 'lodash/uniqBy';

import acquire from '../lib/acquire';
import assure from '../lib/assure';
import logger from '../logger';
import parameters from '../parameters';
import { Artist, TagGetTopArtistsPayload } from '../types';

export default async function getTopArtists(
  tagName: string,
): Promise<readonly Artist[]> {
  logger.debug(`tag.getTopArtists(${tagName})`);
  assure('album.getInfo', { tagName });
  let currentPage = 1;
  let topArtists = [] as readonly Artist[];
  while (currentPage <= parameters.maxPage) {
    const cachePath = join(
      ['tag.getTopArtists', tagName, toString(currentPage)],
      '/',
    );
    // eslint-disable-next-line no-await-in-loop
    const data = await acquire<TagGetTopArtistsPayload>(
      {
        method: 'tag.getTopArtists',
        page: currentPage,
        tag: tagName,
      },
      cachePath,
      (payload) => {
        if (!payload.topartists?.['@attr']) {
          return cachePath;
        }
        return join(
          [
            'tag.getTopArtists',
            payload.topartists['@attr'].tag,
            payload.topartists['@attr'].page,
          ],
          '/',
        );
      },
    );
    const artists: readonly Artist[] | undefined = data?.topartists?.artist;
    if (!artists || isEmpty(artists)) {
      break;
    }
    topArtists = [...topArtists, ...artists];
    if (
      toNumber(data?.topartists?.['@attr'].page) >=
      toNumber(data?.topartists?.['@attr'].totalPages)
    ) {
      break;
    }
    currentPage += 1;
  }
  return uniqBy(topArtists, 'name');
}
