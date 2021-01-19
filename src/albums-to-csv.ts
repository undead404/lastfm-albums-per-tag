import path from 'path';

import { createArrayCsvWriter } from 'csv-writer';
import compact from 'lodash/compact';
import get from 'lodash/get';
import join from 'lodash/join';
import map from 'lodash/map';
import padStart from 'lodash/padStart';
import toString from 'lodash/toString';
import take from 'lodash/take';

import { AlbumInfo, Weighted } from './types';
import parameters from './parameters';

const FILENAME_PART_LENGTH = 3;

export default function writeAlbumsToCsv(
  albums: readonly Weighted<AlbumInfo>[],
): Promise<void> {
  const { limit, maxPage, tagName } = parameters;
  const csvWriter = createArrayCsvWriter({
    header: ['Artist', 'Album', 'Weight', 'Tags', 'Published'],
    path: path.join(
      '.',
      'csv',
      `${join(
        map(compact([tagName, maxPage, limit]), (filenamePart) =>
          padStart(toString(filenamePart), FILENAME_PART_LENGTH, '0'),
        ),
        ' - ',
      )}.csv`,
    ),
  });
  const albumsToWrite = parameters.limit
    ? take(albums, parameters.limit)
    : albums;
  return csvWriter.writeRecords(
    map(albumsToWrite, (album) => [
      album.artist,
      album.name,
      album.weight,
      join(map(get(album, 'tags.tag'), 'name'), ', '),
      get(album, 'wiki.published'),
    ]),
  );
}
