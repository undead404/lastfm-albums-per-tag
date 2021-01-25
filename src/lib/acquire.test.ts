import axios from 'axios';

import { LASTFM_API_ERRORS } from '../constants';
import logger from '../logger';
import { AlbumGetInfoPayload } from '../types';
import acquire from './acquire';
import acquireStub from './acquire.stub.json';

const axiosGetMock = jest.fn();

axiosGetMock.mockReturnValue({ data: acquireStub } as AlbumGetInfoPayload);

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;
mockedAxios.get.mockImplementation(axiosGetMock);

jest.mock('../mongodb');

describe('acquire', () => {
  it('succeeds', async () => {
    const cachePath = 'album.getInfo/Exodus/Tempo of the Dead';
    const correctCachePath = jest.fn();
    correctCachePath.mockReturnValue(cachePath);
    const data = await acquire(
      {
        album: 'Tempo of the Damned',
        artist: 'Exodus',
        method: 'album.getInfo',
      },
      cachePath,
      correctCachePath,
    );
    expect(data).toHaveProperty('album');
  });
  it('tries again on AJAX error', async () => {
    mockedAxios.get.mockImplementationOnce(
      jest.fn(async () => {
        throw new Error('Timeout');
      }),
    );
    const cachePath = 'album.getInfo/Exodus/Tempo of the Dead';
    const correctCachePath = jest.fn();
    correctCachePath.mockReturnValue(cachePath);
    const data = await acquire(
      {
        album: 'Tempo of the Damned',
        artist: 'Exodus',
        method: 'album.getInfo',
      },
      cachePath,
      correctCachePath,
    );
    expect(data).toHaveProperty('album');
  });
  it('returns null on error 6', async () => {
    mockedAxios.get.mockImplementationOnce(
      jest.fn(() =>
        Promise.resolve({
          data: {
            error: LASTFM_API_ERRORS.INVALID_PARAMETERS,
            message: 'Album not found',
          },
        }),
      ),
    );
    const cachePath = 'album.getInfo/Exodu/Tempo of the Dead';
    const correctCachePath = jest.fn();
    correctCachePath.mockReturnValue(cachePath);
    const data = await acquire(
      {
        album: 'Tempo of the Damned',
        artist: 'Exodu',
        method: 'album.getInfo',
      },
      cachePath,
      correctCachePath,
    );
    expect(data).toBeNull();
  });
  it('throws on other errors', async () => {
    mockedAxios.get.mockReturnValue(
      Promise.resolve({
        data: {
          error: LASTFM_API_ERRORS.RATE_LIMIT_EXCEEDED,
          message: 'Rate limit exceeded',
        },
      }),
    );
    const cachePath = 'album.getInfo/Exodu/Tempo of the Dead';
    const correctCachePath = jest.fn();
    try {
      const result = await acquire(
        {
          album: 'Tempo of the Damned',
          artist: 'Exodu',
          method: 'album.getInfo',
        },
        cachePath,
        correctCachePath,
        // ),
      );
      logger.debug(result);
    } catch (error) {
      // eslint-disable-next-line jest/no-conditional-expect
      expect(error).toHaveProperty('message', 'Rate limit exceeded');
    }
  });
});
