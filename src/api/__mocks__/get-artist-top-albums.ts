const getArtistTopAlbums = jest
  .fn()
  .mockImplementation((artistName: string) => {
    if (artistName === 'Exodus') {
      return Promise.resolve([
        {
          name: 'Tempo of the Damned',
          artist: 'Exodus',
          listeners: '122828',
          playcount: '1645277',
          tracks: {
            track: [
              {
                duration: '401',
              },
              {
                duration: '267',
              },
              {
                duration: '376',
              },
              {
                duration: '292',
              },
              {
                duration: '458',
              },
              {
                duration: '358',
              },
              {
                duration: '215',
              },
              {
                duration: '301',
              },
              {
                duration: '324',
              },
              {
                duration: '261',
              },
            ],
          },
          tags: {
            tag: [
              {
                name: 'thrash metal',
              },
              {
                name: 'albums I own',
              },
              {
                name: 'heavy metal',
              },
              { name: 'metal' },
              { name: '2004' },
            ],
          },
          wiki: {
            published: '12 Jun 2012, 11:58',
          },
        },
        {
          name: 'Bonded by Blood',
          artist: 'Exodus',
          listeners: '146666',
          playcount: '2255365',
          tracks: {
            track: [
              {
                duration: '214',
              },
              {
                duration: '256',
              },
              {
                duration: '358',
              },
              {
                duration: '357',
              },
              {
                duration: '257',
              },
              {
                duration: '227',
              },
              {
                duration: '401',
              },
              {
                duration: '429',
              },
              {
                duration: '257',
              },
              {
                duration: '291',
              },
              {
                duration: '205',
              },
            ],
          },
          tags: {
            tag: [
              {
                name: 'thrash metal',
              },
              { name: '1985' },
              {
                name: 'albums I own',
              },
              {
                name: 'speed metal',
              },
              {
                name: 'Masterpiece',
              },
            ],
          },
          wiki: {
            published: '09 Aug 2008, 10:04',
          },
        },
        {
          name: 'Shovel Headed Kill Machine',
          artist: 'Exodus',
          listeners: '69617',
          playcount: '1095719',
          tracks: {
            track: [
              {
                duration: '256',
              },
              {
                duration: '511',
              },
              {
                duration: '254',
              },
              {
                duration: '288',
              },
              {
                duration: '204',
              },
              {
                duration: '456',
              },
              {
                duration: '298',
              },
              {
                duration: '311',
              },
              {
                duration: '416',
              },
              {
                duration: '175',
              },
            ],
          },
          tags: {
            tag: [
              {
                name: 'thrash metal',
              },
              {
                name: 'albums I own',
              },
              { name: '2005' },
              { name: 'Bay Area' },
              { name: 'metal' },
            ],
          },
          wiki: {
            published: '23 Sep 2013, 11:42',
          },
        },
      ]);
    }
    return Promise.resolve();
  });

export default getArtistTopAlbums;
