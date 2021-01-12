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


dotEnvExtended.load();
const { LASTFM_API_KEY } = process.env;
const DEFAULT_PARAMS = {
    api_key: LASTFM_API_KEY,
    format: 'json'
}

const MAX_CACHE_AGE_IN_DAYS = 7;

const MAX_RETRIES = 5;

async function sleep(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    })
}
async function get(parameters, cachePath, retry = 0) {
    const cacheFilePath = `${path.join('.', 'cache', cachePath)}.json`;
    logger.debug(cacheFilePath)
    try {
        const cachedData = await readJson(cacheFilePath);
        if (!cachedData.createdAt || differenceInDays(parseISO(cachedData.createdAt), new Date()) > MAX_CACHE_AGE_IN_DAYS) {
            throw new Error("Cache expires")
        }
        return cachedData;
    } catch (error) {
        logger.error(error);
        const url = `https://ws.audioscrobbler.com/2.0/?${stringify({ ...DEFAULT_PARAMS, ...parameters })}`;
        logger.debug(url);
        const response = await axios.get(url);
        if (response.data.error || isEmpty(response.data)) {
            if (response.data.error === 6) {
                return null;
            }
            if (retry >= MAX_RETRIES) {
                throw new Error(response.data.message);
            }
            logger.warn(`retry #${retry + 1}`)
            await sleep((2 ** retry) * 1000)
            return get(parameters, cachePath, retry + 1)
        }
        outputJson(cacheFilePath, { ...response.data, createdAt: new Date() }, { spaces: 2 });
        return response.data;
    }
}


export const album = {
    async getInfo(albumName, artistName) {
        if (!albumName) {
            throw new Error("no album name provided to album.getInfo")
        }
        if (!artistName) {
            throw new Error("no artist name provided to album.getInfo")
        }
        const data = await get({
            album: albumName,
            artist: artistName,
            method: 'album.getInfo',
        },
            path.join('album.getInfo', filenamify(artistName), filenamify(albumName)))
        return data?.album;
    },
    async getTopTags(albumName, artistName) {
        if (!albumName) {
            throw new Error("no album name provided to album.getTopTags")
        }
        if (!artistName) {
            throw new Error("no artist name provided to album.getTopTags")
        }
        const data = await get({
            album: albumName,
            artist: artistName,
            method: 'album.getTopTags',
        },
            path.join('album.getTopTags', filenamify(artistName), filenamify(albumName)))
        return data?.toptags?.tag;
    }
}

export const artist = {
    async getTopAlbums(artistName) {
        if (!artistName) {
            throw new Error("no artist name provided to artist.getTopAlbums")
        }
        const data = await get({
            artist: artistName,
            method: 'artist.getTopAlbums',
        },
            path.join('artist.getTopAlbums', filenamify(artistName)))
        return data.topalbums.album;
    }
}

export const tag = {
    async getTopArtists(tagName) {
        if (!tagName) {
            throw new Error("no tag name provided to tag.getTopArtists")
        }
        let currentPage = 1;
        let topArtists = [];
        while (currentPage <= 200) {
            const data = await get({
                method: 'tag.getTopArtists',
                page: currentPage,
                tag: tagName
            },
                path.join('tag.getTopArtists', filenamify(tagName), toString(currentPage)))
            if (isEmpty(data.topartists.artist)) {
                break
            }
            topArtists = [...topArtists, ...data.topartists.artist];
            if (toNumber(data.topartists['@attr'].page) >= toNumber(data.topartists['@attr'].totalPages)) {
                break
            }
            currentPage += 1;
        }
        return uniqBy(topArtists, 'name');
        // return data.topartists.artist;
    }
}