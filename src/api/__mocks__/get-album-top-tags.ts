import { Tag } from '../../types';

const getAlbumTopTags = jest
  .fn()
  .mockImplementation((albumName: string, artistName: string) => {
    if (albumName === 'Tempo of the Damned' && artistName === 'Exodus') {
      return [
        {
          count: 100,
          name: 'thrash metal',
        },
        {
          count: 25,
          name: 'albums I own',
        },
        {
          count: 22,
          name: 'heavy metal',
        },
        { count: 14, name: 'metal' },
      ] as readonly Tag[];
    }
    return [];
  });
export default getAlbumTopTags;
