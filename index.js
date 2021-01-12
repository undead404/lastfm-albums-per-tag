
import find from 'lodash/find';
import flatten from 'lodash/flatten';
import forEach from 'lodash/forEach';
import reduce from 'lodash/reduce';
import reject from 'lodash/reject';
import size from 'lodash/size';
import sortBy from 'lodash/sortBy';
import take from 'lodash/take';
import toLower from 'lodash/toLower';
import { album, artist, tag } from './api';
import logger from './logger';

async function sequentialAsyncMap(collection, f) {
    return reduce(collection, async (accumulator, item) =>
        [...await accumulator, await f(item)], Promise.resolve([]));
}

async function getAlbumWeight(albumName, artistName) {
    const albumInfo = await album.getInfo(albumName, artistName);
    if (!albumInfo) {
        return 0;
    }
    const numberOfTracks = size(albumInfo.tracks.track)
    if (!numberOfTracks) {
        return 0;
    }
    return -albumInfo.playcount / albumInfo.listeners * albumInfo.playcount / numberOfTracks
}

async function getAlbumTagCount(albumName, artistName, tagName) {
    const albumTags = await album.getTopTags(albumName, artistName);
    const tagObject = find(albumTags, tagItem => toLower(tagItem.name) === toLower(tagName));
    if (!tagObject) {
        return 0;
    }
    return tagObject.count
}

async function main() {
    const tagName = 'black metal';
    const artists = await tag.getTopArtists(tagName);
    const allAlbums = sortBy(reject(flatten(await sequentialAsyncMap(artists, async artistItem => {
        logger.info(artistItem.name);
        const albums = (await artist.getTopAlbums(artistItem.name));
        return sequentialAsyncMap(albums, async albumItem => {
            const weight = (await getAlbumWeight(albumItem.name, albumItem.artist.name)) * (await getAlbumTagCount(albumItem.name, albumItem.artist.name, tagName));
            return {
                ...albumItem,
                weight
            }
        })

    })), ['weight', 0]), ['weight']);
    forEach(take(allAlbums, 100), albumItem => {
        logger.info(`${albumItem.artist.name} - ${albumItem.name}: ${albumItem.weight}`)
    })

}

main();