import getAlbumWeight from './get-album-weight';

describe('getAlbumWeight', () => {
  it('returns zero on empty input', () => {
    const albumWeight = getAlbumWeight();
    expect(albumWeight).toEqual(0);
  });
  it('returns zero on zero playcount', () => {
    const albumWeight = getAlbumWeight({
      artist: 'Exodus',
      listeners: '1',
      name: 'Tempo of the Damned',
      playcount: '0',
      tracks: {
        track: [],
      },
    });
    expect(albumWeight).toEqual(0);
  });
  it('returns meaningful weight on unknown tracks', () => {
    const albumWeight = getAlbumWeight({
      artist: 'Exodus',
      listeners: '1',
      name: 'Tempo of the Damned',
      playcount: '7',
      tracks: {
        track: [],
      },
    });
    expect(albumWeight).toEqual(7);
  });
  it('returns meaningful weight on known tracks', () => {
    const albumWeight = getAlbumWeight({
      artist: 'Exodus',
      listeners: '1',
      name: 'Tempo of the Damned',
      playcount: '3',
      tracks: {
        track: [{}, {}, {}],
      },
    });
    expect(albumWeight).toEqual(3);
  });
});
