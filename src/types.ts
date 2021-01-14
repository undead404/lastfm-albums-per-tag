import { ReadonlyDate, ReadonlyRecord } from 'readonly-types';

export type Album = {
  readonly artist: {
    readonly name: string;
  };
  readonly name: string;
  readonly playcount: number;
};

export type Payload = {
  readonly error?: number;
  readonly message?: string;
};

export type Track = ReadonlyRecord<string, never>;

export type AlbumInfo = {
  readonly artist: string;
  readonly listeners: string;
  readonly name: string;
  readonly playcount: string;
  readonly tracks: readonly Track[];
};

export type AlbumGetInfoPayload = Payload & {
  readonly album?: AlbumInfo;
};

export type Tag = {
  readonly count: number;
  readonly name: string;
};

export type AlbumGetTopTagsPayload = Payload & {
  readonly toptags?: {
    '@attr': {
      album: string;
      artist: string;
    };
    readonly tag: readonly Tag[];
  };
};

export type Artist = {
  readonly name: string;
};

export type ArtistGetTopAlbumsPayload = Payload & {
  readonly topalbums?: {
    '@attr': {
      artist: string;
    };
    readonly album: readonly Album[];
  };
};

export type Cached<T> = T & {
  readonly updatedAt: ReadonlyDate;
};

export type DefaultParameters = {
  // eslint-disable-next-line camelcase
  readonly api_key: string;
  readonly autocorrect?: '0' | '1';
  readonly format?: 'json' | 'xml';
};

export type LastfmApiMethod =
  | 'album.getInfo'
  | 'album.getTopTags'
  | 'artist.getTopAlbums'
  | 'tag.getTopArtists';

export type Parameters = {
  readonly album?: string;
  readonly artist?: string;
  readonly method: LastfmApiMethod;
  readonly page?: number;
  readonly tag?: string;
};

export type TagGetTopArtistsPayload = Payload & {
  readonly topartists?: {
    readonly '@attr': {
      readonly page: string;
      tag: string;
      readonly totalPages: string;
    };
    readonly artist: readonly Artist[];
  };
};
