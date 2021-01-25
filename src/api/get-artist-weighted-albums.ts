import sequentialAsyncMap from '../lib/sequential-async-map';
import logger from '../logger';
import { AlbumInfo, Artist, Weighted } from '../types';

import getAlbumTagCount from './get-album-tag-count';
import getAlbumWeight from './get-album-weight';
import getArtistTopAlbums from './get-artist-top-albums';

export default async function getArtistWeightedAlbums(
  artistInfo: Artist,
  tagName: string,
): Promise<readonly Weighted<AlbumInfo>[]> {
  logger.debug(`getArtistWeightedAlbums: ${artistInfo.name}, ${tagName}`);
  logger.info(artistInfo.name);
  const albums = await getArtistTopAlbums(artistInfo.name);
  if (!albums) {
    return [];
  }
  return sequentialAsyncMap(albums, async (albumInfo) => {
    const weight =
      getAlbumWeight(albumInfo) *
      (await getAlbumTagCount(albumInfo.name, albumInfo.artist, tagName));
    return {
      ...albumInfo,
      weight,
    } as Weighted<AlbumInfo>;
  });
}
