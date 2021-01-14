import find from 'lodash/find';
import flatten from 'lodash/flatten';
import forEach from 'lodash/forEach';
import reduce from 'lodash/reduce';
import reject from 'lodash/reject';
import size from 'lodash/size';
import sortBy from 'lodash/sortBy';
import take from 'lodash/take';
import toLower from 'lodash/toLower';
import toNumber from 'lodash/toNumber';
import { album, artist, tag } from './api';
import logger from './logger';
import { close } from './mongodb';
import { Album } from './types';

async function sequentialAsyncMap<T1, T2>(
  collection: readonly T1[],
  f: (item: T1) => Promise<T2>,
): Promise<readonly T2[]> {
  return reduce(
    collection,
    async (accumulator, item) => [...(await accumulator), await f(item)],
    Promise.resolve([] as readonly T2[]),
  );
}

async function getAlbumWeight(
  albumName: string,
  artistName: string,
): Promise<number> {
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
  return ((-playcount / listeners) * playcount) / numberOfTracks;
}

async function getAlbumTagCount(
  albumName: string,
  artistName: string,
  tagName: string,
): Promise<number> {
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

type Weighted<T> = T & {
  readonly weight: number;
};

async function main(): Promise<void> {
  try {
    const tagName = 'hardcore';
    const artists = await tag.getTopArtists(tagName);
    const allAlbums: readonly Weighted<Album>[] = sortBy(
      reject(
        flatten(
          await sequentialAsyncMap(artists, async (artistItem) => {
            logger.info(artistItem.name);
            const albums = await artist.getTopAlbums(artistItem.name);
            if (!albums) {
              return [];
            }
            return sequentialAsyncMap(albums, async (albumItem) => {
              const weight =
                (await getAlbumWeight(albumItem.name, albumItem.artist.name)) *
                (await getAlbumTagCount(
                  albumItem.name,
                  albumItem.artist.name,
                  tagName,
                ));
              return {
                ...albumItem,
                weight,
              } as Weighted<Album>;
            });
          }),
        ),
        ['weight', 0],
      ),
      ['weight'],
    );
    forEach(take(allAlbums, 100), (albumItem) => {
      logger.info(
        `${albumItem.artist.name} - ${albumItem.name}: ${albumItem.weight}`,
      );
    });
  } finally {
    close();
  }
}

void main();
