import writeAlbumsToCsv from './albums-to-csv';

import { getTagWeightedAlbums } from './api/tag';
import { close } from './mongodb';

async function main(): Promise<void> {
  try {
    const tagName = 'black metal';
    const albums = await getTagWeightedAlbums(tagName);
    await writeAlbumsToCsv(tagName, albums);
    // forEach(take(albums, NUMBER_OF_ALBUMS_TO_SHOW), (albumItem) => {
    //   logger.info(
    //     `${albumItem.artist.name} - ${albumItem.name}: ${albumItem.weight}`,
    //   );
    // });
  } finally {
    await close();
  }
}

void main();
