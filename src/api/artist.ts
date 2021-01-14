import join from 'lodash/join';
import uniqBy from 'lodash/uniqBy';

import acquire from '../lib/acquire';
import assure from '../lib/assure';
import sequentialAsyncMap from '../lib/sequential-async-map';
import logger from '../logger';
import { Album, Artist, ArtistGetTopAlbumsPayload, Weighted } from '../types';

import { getAlbumTagCount, getAlbumWeight } from './album';

const artist = {
  async getTopAlbums(
    artistName: string,
  ): Promise<readonly Album[] | undefined> {
    assure('album.getInfo', { artistName });
    const cachePath = join(['artist.getTopAlbums', artistName], '/');
    const data = await acquire<ArtistGetTopAlbumsPayload>(
      {
        artist: artistName,
        method: 'artist.getTopAlbums',
      },
      cachePath,
      (payload) => {
        if (!payload.topalbums?.['@attr']) {
          return cachePath;
        }
        return join(
          ['album.getTopTags', payload.topalbums['@attr'].artist],
          '/',
        );
      },
    );
    return uniqBy(data?.topalbums?.album, 'name');
  },
};
export default artist;

export async function getArtistWeightedAlbums(
  artistInfo: Artist,
  tagName: string,
): Promise<readonly Weighted<Album>[]> {
  logger.info(artistInfo.name);
  const albums = await artist.getTopAlbums(artistInfo.name);
  if (!albums) {
    return [];
  }
  return sequentialAsyncMap(albums, async (albumItem) => {
    const weight =
      (await getAlbumWeight(albumItem.name, albumItem.artist.name)) *
      (await getAlbumTagCount(albumItem.name, albumItem.artist.name, tagName));
    return {
      ...albumItem,
      weight,
    } as Weighted<Album>;
  });
}
