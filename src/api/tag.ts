import flatten from 'lodash/flatten';
import isEmpty from 'lodash/isEmpty';
import join from 'lodash/join';
import orderBy from 'lodash/orderBy';
import reject from 'lodash/reject';
import toNumber from 'lodash/toNumber';
import toString from 'lodash/toString';
import uniqBy from 'lodash/uniqBy';

import { MAX_PAGE } from '../constants';
import acquire from '../lib/acquire';
import assure from '../lib/assure';
import sequentialAsyncMap from '../lib/sequential-async-map';
import logger from '../logger';
import { Album, Artist, TagGetTopArtistsPayload, Weighted } from '../types';

import { getArtistWeightedAlbums } from './artist';

const tag = {
  async getTopArtists(tagName: string): Promise<readonly Artist[]> {
    logger.debug(`tag.getTopArtists(${tagName})`);
    assure('album.getInfo', { tagName });
    let currentPage = 1;
    let topArtists = [] as readonly Artist[];
    while (currentPage <= MAX_PAGE) {
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
              'album.getTopTags',
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
  },
};
export default tag;

export async function getTagWeightedAlbums(
  tagName: string,
): Promise<readonly Weighted<Album>[]> {
  logger.debug(`getTagWeightedAlbums(${tagName})`);
  const artists = await tag.getTopArtists(tagName);
  return orderBy(
    reject(
      flatten(
        await sequentialAsyncMap(artists, (artistItem) =>
          getArtistWeightedAlbums(artistItem, tagName),
        ),
      ),
      ['weight', 0],
    ),
    ['weight'],
    ['desc'],
  );
}
