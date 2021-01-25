import exodus1 from './Exodus - Bonded by Blood.json';
import exodus2 from './Exodus - Tempo of the Damned.json';
import exodus3 from './Exodus - Shovel Headed Kill Machine.json';

const getAlbumInfo = jest
  .fn()
  .mockImplementation((albumName: string, artistName: string) => {
    if (artistName === 'Exodus') {
      switch (albumName) {
        case 'Bonded by Blood':
          return Promise.resolve(exodus1);
        case 'Tempo of the Damned':
          return Promise.resolve(exodus2);
        case 'Shovel Headed Kill Machine':
          return Promise.resolve(exodus3);
        default:
          return Promise.resolve();
      }
    }
    return Promise.resolve();
  });
export default getAlbumInfo;
