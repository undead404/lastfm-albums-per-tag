import compact from 'lodash/compact';
import isEmpty from 'lodash/isEmpty';
import join from 'lodash/join';
import reject from 'lodash/reject';
import uniqBy from 'lodash/uniqBy';

import acquire from '../lib/acquire';
import assure from '../lib/assure';
import sequentialAsyncMap from '../lib/sequential-async-map';
import logger from '../logger';
import { AlbumInfo, ArtistGetTopAlbumsPayload } from '../types';
import getAlbumInfo from './get-album-info';

// const DEFAULT_PAGE_LIMIT = 200;
const DEFAULT_PAGE_LIMIT = 4;

export default async function getArtistTopAlbums(
  artistName: string,
): Promise<readonly AlbumInfo[]> {
  logger.debug(`artist.getTopAlbums(${artistName})`);
  assure('artist.getTopAlbums', { artistName });
  let currentPage = 1;
  let albums: AlbumInfo[] = [];
  while (currentPage <= DEFAULT_PAGE_LIMIT) {
    const cachePath = join(
      ['artist.getTopAlbums', artistName, currentPage],
      '/',
    );
    // eslint-disable-next-line no-await-in-loop
    const data = await acquire<ArtistGetTopAlbumsPayload>(
      {
        artist: artistName,
        method: 'artist.getTopAlbums',
        page: currentPage,
      },
      cachePath,
      ((enclosedCachePath, enclosedCurrentPage) => (
        payload: ArtistGetTopAlbumsPayload,
      ) => {
        if (!payload.topalbums?.['@attr']) {
          return enclosedCachePath;
        }
        return join(
          [
            'artist.getTopAlbums',
            payload.topalbums['@attr'].artist,
            enclosedCurrentPage,
          ],
          '/',
        );
      })(cachePath, currentPage),
    );
    const currentAlbums = reject(data?.topalbums?.album, ['name', '(null)']);
    if (isEmpty(currentAlbums)) {
      break;
    }
    // eslint-disable-next-line no-await-in-loop
    const albumInfos = await sequentialAsyncMap(currentAlbums, (albumItem) =>
      getAlbumInfo(albumItem.name, albumItem.artist.name),
    );
    albums = [...albums, ...compact(uniqBy(albumInfos, 'name'))];
    currentPage += 1;
  }
  return albums;
}
