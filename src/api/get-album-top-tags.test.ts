import getAlbumTopTags from './get-album-top-tags';

jest.mock('../lib/acquire');
jest.mock('../tags-whitelist');
jest.mock('./get-artist-top-tags');

describe('getAlbumTopTags', () => {
  it('succeeds on proper response', async () => {
    const tags = await getAlbumTopTags('Tempo of the Damned', 'Exodus');
    expect(tags).not.toHaveLength(0);
  });
  it('returns empty array on a typo', async () => {
    const tags = await getAlbumTopTags('Tempo of the Damned', 'Exodu');
    expect(tags).toHaveLength(0);
  });
});
