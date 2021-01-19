import join from 'lodash/join';

import acquire from '../lib/acquire';
import assure from '../lib/assure';
import logger from '../logger';
import { AlbumGetInfoPayload, AlbumInfo } from '../types';

export default async function getAlbumInfo(
  albumName: string,
  artistName: string,
): Promise<AlbumInfo | undefined> {
  logger.debug(`album.getInfo(${albumName}, ${artistName})`);
  assure('album.getInfo', { albumName, artistName });
  const cachePath = join(['album.getInfo', artistName, albumName], '/');
  const data = await acquire<AlbumGetInfoPayload>(
    {
      album: albumName,
      artist: artistName,
      method: 'album.getInfo',
    },
    cachePath,
    (payload) => {
      if (!payload.album) {
        return cachePath;
      }
      return join(
        ['album.getInfo', payload.album.artist, payload.album.name],
        '/',
      );
    },
  );
  return data?.album;
}
