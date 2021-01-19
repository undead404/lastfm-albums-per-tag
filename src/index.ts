import writeAlbumsToCsv from './albums-to-csv';
import { getTagWeightedAlbums } from './api/tag';
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
    await initWhitelistedTags();
    const albums = await getTagWeightedAlbums(tagName);
    await writeAlbumsToCsv(albums);
    // forEach(take(albums, NUMBER_OF_ALBUMS_TO_SHOW), (albumItem) => {
    //   logger.info(
    //     `${albumItem.artist.name} - ${albumItem.name}: ${albumItem.weight}`,
    //   );
    // });
  } finally {
    await connection.close();
  }
}

void main();
