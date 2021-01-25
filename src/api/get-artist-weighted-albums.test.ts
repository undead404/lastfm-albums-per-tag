import getArtistWeightedAlbums from './get-artist-weighted-albums';

jest.mock('./get-album-tag-count');
jest.mock('./get-artist-top-albums');

describe('getArtistWeightedAlbums', () => {
  it('returns nothing on typo', async () => {
    const weightedAlbums = await getArtistWeightedAlbums(
      {
        name: 'Exodu',
      },
      'thrash metal',
    );
    expect(weightedAlbums).toHaveLength(0);
  });
  it('succeeds', async () => {
    const weightedAlbums = await getArtistWeightedAlbums(
      {
        name: 'Exodus',
      },
      'thrash metal',
    );
    expect(weightedAlbums).not.toHaveLength(0);
  });
});
