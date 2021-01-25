import getArtistTopAlbums from './get-artist-top-albums';

jest.mock('../lib/acquire');
jest.mock('./get-album-info');

describe('getArtistTopAlbums', () => {
  it('returns empty array on typo', async () => {
    const albums = await getArtistTopAlbums('Exodu');
    expect(albums).toHaveLength(0);
  });
  it('collects all pages', async () => {
    const albums = await getArtistTopAlbums('Exodus');
    expect(albums).toHaveLength(3);
  });
});
