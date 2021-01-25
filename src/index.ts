import notifier from 'node-notifier';

import writeAlbumsToCsv from './albums-to-csv';
import getTagWeightedAlbums from './api/get-tag-weighted-albums';
import connection from './mongodb';
import parameters from './parameters';
import { initWhitelistedTags } from './tags-whitelist';

async function main(): Promise<void> {
  try {
    // eslint-disable-next-line no-magic-numbers
    const { tagName }: { tagName: string } = parameters;
    if (!tagName) {
      throw new Error('Tag name must be supplied');
    }
    try {
      await initWhitelistedTags();
      const albums = await getTagWeightedAlbums(tagName);
      await writeAlbumsToCsv(albums);
      notifier.notify({
        message: 'Success',
        sound: true,
        title: tagName,
        wait: false,
      });
      // forEach(take(albums, NUMBER_OF_ALBUMS_TO_SHOW), (albumItem) => {
      //   logger.info(
      //     `${albumItem.artist.name} - ${albumItem.name}: ${albumItem.weight}`,
      //   );
      // });
    } catch (error) {
      notifier.notify({
        message: error.message,
        sound: true,
        title: tagName,
        wait: false,
      });
    }
  } finally {
    await connection.close();
  }
}

void main();
