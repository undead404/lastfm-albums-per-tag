import map from 'lodash/map';
import size from 'lodash/size';
import sum from 'lodash/sum';
import toNumber from 'lodash/toNumber';

import logger from '../logger';
import { AlbumInfo } from '../types';

const AVERAGE_NUMBER_OF_TRACKS = 7;
const AVERAGE_SONG_DURATION = 210;

export default function getAlbumWeight(albumInfo?: AlbumInfo): number {
  logger.debug(`getAlbumWeight: ${albumInfo?.artist} - ${albumInfo?.name}`);
  if (!albumInfo) {
    return 0;
  }
  const numberOfTracks =
    size(albumInfo.tracks.track) || AVERAGE_NUMBER_OF_TRACKS;
  const listeners = toNumber(albumInfo.listeners);
  const playcount = toNumber(albumInfo.playcount);
  if (!listeners || !playcount) {
    return 0;
  }
  const averageSongDuration =
    sum(map(albumInfo.tracks.track, (track) => toNumber(track.duration))) /
      numberOfTracks || AVERAGE_SONG_DURATION;
  return (
    // (((playcount / listeners) * playcount) / numberOfTracks) *
    //   averageSongDuration || 0
    ((playcount * listeners) / numberOfTracks) * averageSongDuration || 0
  );
}
