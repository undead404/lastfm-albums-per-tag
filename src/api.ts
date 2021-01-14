import axios from 'axios';
import isEmpty from 'lodash/isEmpty';
import join from 'lodash/join';
import toNumber from 'lodash/toNumber';
import toString from 'lodash/toString';
import uniqBy from 'lodash/uniqBy';
import acquire from './lib/acquire';
import assure from './lib/assure';
import {
    Album,
    AlbumGetInfoPayload,
    AlbumGetTopTagsPayload,
    AlbumInfo,
    Artist,
    ArtistGetTopAlbumsPayload,
    Tag,
    TagGetTopArtistsPayload,
} from './types';

export const album = {
    async getInfo(
        albumName: string,
        artistName: string,
    ): Promise<AlbumInfo | undefined> {
        assure('album.getInfo', { albumName, artistName });
        const cachePath = join(['album.getInfo', artistName, albumName], '/');
        const data = await acquire<AlbumGetInfoPayload>(
            {
                album: albumName,
                artist: artistName,
                method: 'album.getInfo',
            },
            cachePath,
            (payload) => {
                if (!payload.album) {
                    return cachePath;
                }
                return join(
                    [
                        'album.getInfo',
                        payload.album.artist,
                        payload.album.name,
                    ],
                    '/',
                );
            },
        );
        return data?.album;
    },
    async getTopTags(
        albumName: string,
        artistName: string,
    ): Promise<readonly Tag[]> {
      assure('album.getInfo', { albumName, artistName });
        const cachePath = join(
            ['album.getTopTags', artistName, albumName],
            '/',
        );
        const data = await acquire<AlbumGetTopTagsPayload>(
            {
                album: albumName,
                artist: artistName,
                method: 'album.getTopTags',
            },
            cachePath,
            (payload) => {
                if (!payload.toptags?.['@attr']) {
                    return cachePath;
                }
                return join(
                    [
                        'album.getTopTags',
                        payload.toptags['@attr'].artist,
                        payload.toptags['@attr'].album,
                    ],
                    '/',
                );
            },
        );
        return uniqBy(data?.toptags?.tag, 'name');
    },
};

export const artist = {
    async getTopAlbums(
        artistName: string,
    ): Promise<readonly Album[] | undefined> {
      assure('album.getInfo', { artistName });
        const cachePath = join(['artist.getTopAlbums', artistName], '/');
        const data = await acquire<ArtistGetTopAlbumsPayload>(
            {
                artist: artistName,
                method: 'artist.getTopAlbums',
            },
            cachePath,
            (payload) => {
                if (!payload.topalbums?.['@attr']) {
                    return cachePath;
                }
                return join(
                    ['album.getTopTags', payload.topalbums['@attr'].artist],
                    '/',
                );
            },
        );
        return uniqBy(data?.topalbums?.album, 'name');
    },
};

export const tag = {
    async getTopArtists(tagName: string): Promise<readonly Artist[]> {
      assure('album.getInfo', { tagName });
        let currentPage = 1;
        let topArtists = [] as readonly Artist[];
        while (currentPage <= 10) {
            const cachePath = join(
                ['tag.getTopArtists', tagName, toString(currentPage)],
                '/',
            );
            // eslint-disable-next-line no-await-in-loop
            const data = await acquire<TagGetTopArtistsPayload>(
                {
                    method: 'tag.getTopArtists',
                    page: currentPage,
                    tag: tagName,
                },
                cachePath,
                (payload) => {
                    if (!payload.topartists?.['@attr']) {
                        return cachePath;
                    }
                    return join(
                        [
                            'album.getTopTags',
                            payload.topartists['@attr'].tag,
                            payload.topartists['@attr'].page,
                        ],
                        '/',
                    );
                },
            );
            const artists: readonly Artist[] | undefined =
                data?.topartists?.artist;
            if (!artists || isEmpty(artists)) {
                break;
            }
            topArtists = [...topArtists, ...artists];
            if (
                toNumber(data?.topartists?.['@attr'].page) >=
                toNumber(data?.topartists?.['@attr'].totalPages)
            ) {
                break;
            }
            currentPage += 1;
        }
        return uniqBy(topArtists, 'name');
    },
};
