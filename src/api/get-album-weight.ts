import size from 'lodash/size';
import toNumber from 'lodash/toNumber';

import logger from '../logger';
import { AlbumInfo } from '../types';

const AVERAGE_NUMBER_OF_TRACKS = 7;

export default function getAlbumWeight(albumInfo: AlbumInfo): number {
  logger.debug(`getAlbumWeight: ${albumInfo.artist} - ${albumInfo.name}`);
  if (!albumInfo) {
    return 0;
  }
  const numberOfTracks = size(albumInfo.tracks) || AVERAGE_NUMBER_OF_TRACKS;
  const listeners = toNumber(albumInfo.listeners);
  const playcount = toNumber(albumInfo.playcount);
  if (!listeners || !playcount) {
    return 0;
  }
  return ((playcount / listeners) * playcount) / numberOfTracks || 0;
}
