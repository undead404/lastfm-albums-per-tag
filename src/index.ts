import forEach from 'lodash/forEach';
import take from 'lodash/take';

import { getTagWeightedAlbums } from './api/tag';
import logger from './logger';
import { close } from './mongodb';

async function main(): Promise<void> {
  try {
    const tagName = 'hardcore';
    const albums = await getTagWeightedAlbums(tagName);
    forEach(take(albums, 100), (albumItem) => {
      logger.info(
        `${albumItem.artist.name} - ${albumItem.name}: ${albumItem.weight}`,
      );
    });
  } finally {
    await close();
  }
}

void main();
