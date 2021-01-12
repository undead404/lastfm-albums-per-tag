import path from 'path';

import axios from "axios"
import differenceInDays from 'date-fns/differenceInDays'
import parseISO from 'date-fns/parseISO';
import dotEnvExtended from 'dotenv-extended';
import filenamify from 'filenamify';
import { outputJson, readJson } from 'fs-extra';
import isEmpty from 'lodash/isEmpty';
import toNumber from 'lodash/toNumber';
import toString from 'lodash/toString';
import uniqBy from 'lodash/uniqBy';
import { stringify } from "query-string";
import logger from "./logger";
import Album from './types/Album';


dotEnvExtended.load();
const { LASTFM_API_KEY } = process.env;
interface DefaultParameters {
    api_key: string;
    format?: 'json' | 'xml'
}
const DEFAULT_PARAMS: DefaultParameters = {
    api_key: LASTFM_API_KEY,
    format: 'json'
}

const MAX_CACHE_AGE_IN_DAYS = 7;

const MAX_RETRIES = 5;

type LastfmApiMethod = 'album.getInfo' | 'album.getTopTags' | 'artist.getTopAlbums' | 'tag.getTopArtists'

interface Parameters {
    album?: string;
    artist?: string;
    method: LastfmApiMethod;
    page?: number;
    tag?: string;
}

interface Response {
    error?: number;
    message?: string;
}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Track { }
interface AlbumInfo {
    artist: string;
    listeners: string;
    name: string;
    playcount: string;
    tracks: Track[]
}
interface AlbumGetInfoResponse extends Response {
    album?: AlbumInfo
}
interface Tag {
    count: number;
    name: string;
}

interface AlbumGetTopTagsResponse extends Response {
    toptags?: {
        tag: Tag[]
    }
}



interface ArtistGetTopAlbumsResponse extends Response {
    topalbums?: {
        album: Album[]
    }
}

interface Artist {
    name: string;
}

interface TagGetTopArtistsResponse extends Response {
    topartists?: {
        "@attr": {
            page: string;
            totalPages: string;
        };
        artist: Artist[]
    }
}

type CachedValue<T> = T & {
    createdAt: string;
}

async function sleep(ms: number): Promise<void> {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    })
}
async function get<T extends Response>(parameters: Parameters, cachePath: string, retry = 0): Promise<T> {
    const cacheFilePath = `${path.join('.', 'cache', cachePath)}.json`;
    logger.debug(cacheFilePath)
    try {
        const cachedData: CachedValue<T> = await readJson(cacheFilePath);
        if (!cachedData.createdAt || differenceInDays(parseISO(cachedData.createdAt), new Date()) > MAX_CACHE_AGE_IN_DAYS) {
            throw new Error("Cache expires")
        }
        return cachedData;
    } catch (error) {
        logger.error(error);
        const url = `https://ws.audioscrobbler.com/2.0/?${stringify({ ...DEFAULT_PARAMS, ...parameters })}`;
        logger.debug(url);
        const response = await axios.get<T>(url);
        if (response.data.error || isEmpty(response.data)) {
            if (response.data?.error === 6) {
                return null;
            }
            if (retry >= MAX_RETRIES) {
                throw new Error(response.data.message);
            }
            logger.warn(`retry #${retry + 1}`)
            await sleep((2 ** retry) * 1000)
            return get<T>(parameters, cachePath, retry + 1)
        }
        outputJson(cacheFilePath, { ...response.data, createdAt: new Date() }, { spaces: 2 });
        return response.data as T;
    }
}


export const album = {
    async getInfo(albumName: string, artistName: string): Promise<AlbumInfo | undefined> {
        if (!albumName) {
            throw new Error("no album name provided to album.getInfo")
        }
        if (!artistName) {
            throw new Error("no artist name provided to album.getInfo")
        }
        const data = await get<AlbumGetInfoResponse>({
            album: albumName,
            artist: artistName,
            method: 'album.getInfo',
        },
            path.join('album.getInfo', filenamify(artistName), filenamify(albumName)))
        return data?.album;
    },
    async getTopTags(albumName: string, artistName: string): Promise<Tag[]> {
        if (!albumName) {
            throw new Error("no album name provided to album.getTopTags")
        }
        if (!artistName) {
            throw new Error("no artist name provided to album.getTopTags")
        }
        const data = await get<AlbumGetTopTagsResponse>({
            album: albumName,
            artist: artistName,
            method: 'album.getTopTags',
        },
            path.join('album.getTopTags', filenamify(artistName), filenamify(albumName)))
        return data?.toptags.tag;
    }
}

export const artist = {
    async getTopAlbums(artistName: string): Promise<Album[]> {
        if (!artistName) {
            throw new Error("no artist name provided to artist.getTopAlbums")
        }
        const data = await get<ArtistGetTopAlbumsResponse>({
            artist: artistName,
            method: 'artist.getTopAlbums',
        },
            path.join('artist.getTopAlbums', filenamify(artistName)))
        return data?.topalbums.album;
    }
}

export const tag = {
    async getTopArtists(tagName: string): Promise<Artist[]> {
        if (!tagName) {
            throw new Error("no tag name provided to tag.getTopArtists")
        }
        let currentPage = 1;
        let topArtists = [] as Artist[];
        while (currentPage <= 200) {
            // eslint-disable-next-line no-await-in-loop
            const data = await get<TagGetTopArtistsResponse>({
                method: 'tag.getTopArtists',
                page: currentPage,
                tag: tagName
            },
                path.join('tag.getTopArtists', filenamify(tagName), toString(currentPage)))
            if (isEmpty(data?.topartists.artist)) {
                break
            }
            topArtists = [...topArtists, ...data.topartists.artist];
            if (toNumber(data?.topartists['@attr'].page) >= toNumber(data?.topartists['@attr'].totalPages)) {
                break
            }
            currentPage += 1;
        }
        return uniqBy(topArtists, 'name');
        // return data.topartists.artist;
    }
}