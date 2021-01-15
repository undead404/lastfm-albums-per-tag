import path from 'path';

import { createArrayCsvWriter } from 'csv-writer';
import get from 'lodash/get';
import join from 'lodash/join';
import map from 'lodash/map';

import { Album, Weighted } from './types';

export default function writeAlbumsToCsv(
  tagName: string,
  albums: readonly Weighted<Album>[],
): Promise<void> {
  const csvWriter = createArrayCsvWriter({
    header: ['Artist', 'Album', 'Weight', 'Tags', 'Published'],
    path: path.join('.', 'csv', `${tagName}.csv`),
  });
  return csvWriter.writeRecords(
    map(albums, (album) => {
      // console.info(album);
      const record = [
        album.artist.name,
        album.name,
        album.weight,
        join(map(get(album, 'tags.tag'), 'name'), ', '),
        get(album, 'wiki.published'),
      ];
      if (!record[3]) {
        console.info(album, record);
        throw new Error('Empty fields');
      }
      return record;
    }),
  );
}
