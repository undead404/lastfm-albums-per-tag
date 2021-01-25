import getArtistTopTags from './get-artist-top-tags';

jest.mock('../lib/acquire');

describe('getArtistTopTags', () => {
  it('returns empty array on typo', async () => {
    const tags = await getArtistTopTags('Exodu');
    expect(tags).toHaveLength(0);
  });
  it('collects all pages', async () => {
    const tags = await getArtistTopTags('Exodus');
    expect(tags).not.toHaveLength(0);
  });
});
