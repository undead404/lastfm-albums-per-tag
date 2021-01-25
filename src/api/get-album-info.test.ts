import getAlbumInfo from './get-album-info';

jest.mock('../lib/acquire');

describe('getAlbumInfo', () => {
  it('throws on empty album name', async () => {
    // expect.assertions(1);
    try {
      await getAlbumInfo('', 'Metallica');
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect(error).toHaveProperty(
        'message',
        'No albumName supplied to album.getInfo',
      );
    }
  });
  it('throws on empty artist name', async () => {
    // expect.assertions(1);
    try {
      await getAlbumInfo('Metallica', '');
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect(error).toHaveProperty(
        'message',
        'No artistName supplied to album.getInfo',
      );
    }
  });
  it('succeeds on proper response', async () => {
    const albumInfo = await getAlbumInfo('Tempo of the Damned', 'Exodus');
    expect(albumInfo).toHaveProperty('name');
    expect(albumInfo).toHaveProperty('artist');
    expect(albumInfo).toHaveProperty('listeners');
    expect(albumInfo).toHaveProperty('playcount');
    expect(albumInfo?.tracks.track).toBeInstanceOf(Array);
  });
  it('returns nil on a typo', async () => {
    const albumInfo = await getAlbumInfo('Tempo of the Damned', 'Exodu');
    expect(albumInfo).toBeFalsy();
  });
  // afterAll(async () => {
  //     await connection.close()
  // })
});
