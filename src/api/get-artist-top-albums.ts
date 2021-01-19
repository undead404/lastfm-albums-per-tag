import compact from 'lodash/compact';
import join from 'lodash/join';
// import toNumber from 'lodash/toNumber';
import uniqBy from 'lodash/uniqBy';

import acquire from '../lib/acquire';
import assure from '../lib/assure';
import sequentialAsyncMap from '../lib/sequential-async-map';
import logger from '../logger';
import { AlbumInfo, ArtistGetTopAlbumsPayload } from '../types';
import getAlbumInfo from './get-album-info';

// const DEFAULT_PAGE_LIMIT = 200;
const DEFAULT_PAGE_LIMIT = 4;

export default async function getTopAlbums(
  artistName: string,
): Promise<readonly AlbumInfo[]> {
  logger.debug(`artist.getTopAlbums(${artistName})`);
  assure('artist.getTopAlbums', { artistName });
  let currentPage = 1;
  let albums: AlbumInfo[] = [];
  let pageLimit;
  while (currentPage < (pageLimit || DEFAULT_PAGE_LIMIT)) {
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
    if (!data?.topalbums?.album) {
      break;
    }
    // if (!pageLimit) {
    //   pageLimit = toNumber(data.topalbums['@attr'].totalPages);
    //   if (pageLimit > DEFAULT_PAGE_LIMIT) {
    //     pageLimit = DEFAULT_PAGE_LIMIT;
    //   }
    // }
    // eslint-disable-next-line no-await-in-loop
    const albumInfos = await sequentialAsyncMap(
      data?.topalbums?.album,
      (albumItem) => getAlbumInfo(albumItem.name, albumItem.artist.name),
    );
    albums = [...albums, ...compact(uniqBy(albumInfos, 'name'))];
    currentPage += 1;
  }
  return albums;
}
