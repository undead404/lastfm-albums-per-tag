import join from 'lodash/join';
import some from 'lodash/some';
import uniqBy from 'lodash/uniqBy';

import acquire from '../lib/acquire';
import assure from '../lib/assure';
import logger from '../logger';
import isTagWhitelisted from '../tags-whitelist';
import { AlbumGetTopTagsPayload, Tag } from '../types';
import getArtistTopTags from './get-artist-top-tags';

export default async function getAlbumTopTags(
  albumName: string,
  artistName: string,
): Promise<readonly Tag[]> {
  logger.debug(`album.getTopTags(${albumName}, ${artistName})`);
  assure('album.getTopTags', { albumName, artistName });
  const cachePath = join(['album.getTopTags', artistName, albumName], '/');
  const data = await acquire<AlbumGetTopTagsPayload>(
    {
      album: albumName,
      artist: artistName,
      method: 'album.getTopTags',
    },
    cachePath,
    (payload) => {
      if (!payload.toptags?.['@attr']) {
        return cachePath;
      }
      return join(
        [
          'album.getTopTags',
          payload.toptags['@attr'].artist,
          payload.toptags['@attr'].album,
        ],
        '/',
      );
    },
  );
  const tags = data?.toptags?.tag;
  if (!some(tags, (tag) => isTagWhitelisted(tag.name))) {
    logger.warn(`No tags for ${albumName} by ${artistName}: ${tags}`);
    return getArtistTopTags(artistName);
  }
  return uniqBy(tags, 'name');
}
