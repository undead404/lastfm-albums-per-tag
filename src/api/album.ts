import find from 'lodash/find';
import join from 'lodash/join';
import size from 'lodash/size';
import toLower from 'lodash/toLower';
import toNumber from 'lodash/toNumber';
import uniqBy from 'lodash/uniqBy';

import acquire from '../lib/acquire';
import assure from '../lib/assure';
import logger from '../logger';
import {
  AlbumGetInfoPayload,
  AlbumGetTopTagsPayload,
  AlbumInfo,
  Tag,
} from '../types';

const album = {
  async getInfo(
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
  },
  async getTopTags(
    albumName: string,
    artistName: string,
  ): Promise<readonly Tag[]> {
    logger.debug(`album.getTopTags(${albumName}, ${artistName})`);
    assure('album.getInfo', { albumName, artistName });
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
    return uniqBy(data?.toptags?.tag, 'name');
  },
};
export default album;

export async function getAlbumTagCount(
  albumName: string,
  artistName: string,
  tagName: string,
): Promise<number> {
  logger.debug(`getAlbumTagCount(${albumName}, ${artistName}, ${tagName})`);
  const albumTags = await album.getTopTags(albumName, artistName);
  const tagObject = find(
    albumTags,
    (tagItem) => toLower(tagItem.name) === toLower(tagName),
  );
  if (!tagObject) {
    return 0;
  }
  return tagObject.count;
}

export async function getAlbumWeight(
  albumName: string,
  artistName: string,
): Promise<number> {
  logger.debug(`getAlbumWeight(${albumName}, ${artistName})`);
  const albumInfo = await album.getInfo(albumName, artistName);
  if (!albumInfo) {
    return 0;
  }
  const numberOfTracks = size(albumInfo.tracks);
  if (!numberOfTracks) {
    return 0;
  }
  const listeners = toNumber(albumInfo.listeners);
  const playcount = toNumber(albumInfo.playcount);
  return ((playcount / listeners) * playcount) / numberOfTracks;
}
