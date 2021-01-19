import join from 'lodash/join';
import uniqBy from 'lodash/uniqBy';

import acquire from '../lib/acquire';
import assure from '../lib/assure';
import logger from '../logger';
import { ArtistGetTopTagsPayload, Tag } from '../types';

export default async function getArtistTopTags(
  artistName: string,
): Promise<readonly Tag[]> {
  logger.debug(`artist.getTopTags(${artistName})`);
  assure('artist.getTopTags', { artistName });
  const cachePath = join(['artist.getTopTags', artistName], '/');
  const data = await acquire<ArtistGetTopTagsPayload>(
    {
      artist: artistName,
      method: 'artist.getTopTags',
    },
    cachePath,
    (payload) => {
      if (!payload.toptags?.['@attr']) {
        return cachePath;
      }
      return join(['artist.getTopTags', payload.toptags['@attr'].artist], '/');
    },
  );
  const tags = data?.toptags?.tag;
  return uniqBy(tags, 'name');
}
