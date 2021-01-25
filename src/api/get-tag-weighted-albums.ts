import flatten from 'lodash/flatten';
import orderBy from 'lodash/orderBy';
import reject from 'lodash/reject';
import uniqBy from 'lodash/uniqBy';

import sequentialAsyncMap from '../lib/sequential-async-map';
import logger from '../logger';
import { AlbumInfo, Weighted } from '../types';
import getArtistWeightedAlbums from './get-artist-weighted-albums';
import getTopArtists from './get-tag-top-artists';

export default async function getTagWeightedAlbums(
  tagName: string,
): Promise<readonly Weighted<AlbumInfo>[]> {
  logger.debug(`getTagWeightedAlbums(${tagName})`);
  const artists = await getTopArtists(tagName);
  return orderBy(
    uniqBy(
      reject(
        flatten(
          await sequentialAsyncMap(artists, (artistItem) =>
            getArtistWeightedAlbums(artistItem, tagName),
          ),
        ),
        ['weight', 0],
      ),
      (album) => `${album.artist} - ${album.name}`,
    ),
    ['weight'],
    ['desc'],
  );
}
