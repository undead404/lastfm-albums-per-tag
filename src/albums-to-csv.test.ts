import writeAlbumsToCsv from './albums-to-csv';

jest.mock('csv-writer');
jest.mock('./parameters');

describe('writeAlbumsToCsv', () => {
  it('succeeds on empty input', async () => {
    await writeAlbumsToCsv([]);
  });
  it('succeeds on meaningful input', async () => {
    await writeAlbumsToCsv([
      {
        artist: 'Metallica',
        listeners: '3',
        name: 'Mettalica',
        playcount: '30',
        tracks: { track: [{}] },
        weight: 1,
      },
    ]);
  });
  it('succeeds on big input', async () => {
    await writeAlbumsToCsv([
      {
        artist: 'Metallica',
        listeners: '3',
        name: 'Mettalica',
        playcount: '30',
        tracks: { track: [{}] },
        weight: 1,
      },
      {
        artist: 'Metallica',
        listeners: '3',
        name: 'Mettalica2',
        playcount: '30',
        tracks: { track: [{}] },
        weight: 1,
      },
      {
        artist: 'Metallica',
        listeners: '3',
        name: 'Mettalica3',
        playcount: '30',
        tracks: { track: [{}] },
        weight: 1,
      },
    ]);
  });
});
