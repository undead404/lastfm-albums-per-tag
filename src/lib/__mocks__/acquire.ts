import {
  AlbumGetInfoPayload,
  AlbumGetTopTagsPayload,
  LastfmApiMethod,
  TagGetTopArtistsPayload,
} from '../../types';
import getAlbumInfoStub from './get-album-info.stub.json';
import getAlbumTopTagsStub from './get-album-top-tags.stub.json';
import getArtistTopAlbums1 from './get-artist-top-albums-1.stub.json';
import getArtistTopAlbums2 from './get-artist-top-albums-2.stub.json';
import getArtistTopTags from './get-artist-top-tags.stub.json';

const acquire = jest.fn().mockImplementation(
  (
    {
      album,
      artist,
      method,
      page,
    }: {
      album: string;
      artist: string;
      method: LastfmApiMethod;
      page?: number;
    },
    cachePath: string,
  ) => {
    switch (method) {
      case 'album.getInfo':
        if (artist === 'Exodus' && album === 'Tempo of the Damned') {
          return Promise.resolve(getAlbumInfoStub as AlbumGetInfoPayload);
        }
        return Promise.resolve();
      case 'album.getTopTags':
        if (artist === 'Exodus' && album === 'Tempo of the Damned') {
          return Promise.resolve(getAlbumTopTagsStub as AlbumGetTopTagsPayload);
        }
        return Promise.resolve();
      case 'artist.getTopAlbums':
        if (artist === 'Exodus') {
          if (page === 1) {
            return Promise.resolve(
              getArtistTopAlbums1 as TagGetTopArtistsPayload,
            );
          }
          if (page === 2) {
            return Promise.resolve(
              getArtistTopAlbums2 as TagGetTopArtistsPayload,
            );
          }
        }
        return Promise.resolve();
      case 'artist.getTopTags':
        if (artist === 'Exodus') {
          return Promise.resolve(getArtistTopTags);
        }
        return Promise.resolve();
      default:
        return Promise.resolve();
    }
  },
);

export default acquire;
