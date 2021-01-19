import { writeFile } from 'fs-extra';
import join from 'lodash/join';
import map from 'lodash/map';
import sortBy from 'lodash/sortBy';
import toLower from 'lodash/toLower';
import trim from 'lodash/trim';
import logger from './logger';

import connection from './mongodb';

async function main(): Promise<void> {
  const collection = await connection.getCollection();
  try {
    const tags: string[] = sortBy(
      map(
        await collection
          .aggregate([
            {
              $match: {
                cachePath: {
                  $regex: new RegExp('album.getTopTags'),
                },
              },
            },
            {
              $project: {
                tags: '$data.toptags.tag',
              },
            },
            {
              $unwind: {
                path: '$tags',
                preserveNullAndEmptyArrays: false,
              },
            },
            {
              $group: {
                _id: '$tags.name',
                tag: {
                  $first: '$tags.name',
                },
              },
            },
          ])
          .toArray(),
        ({ tag }) => trim(toLower(tag)),
      ),
    );
    await writeFile('tags.txt', join(tags, '\r\n'));
    logger.info('Tags extraction success!');
  } finally {
    await connection.close();
  }
}

void main();
