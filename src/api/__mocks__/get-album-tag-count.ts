const getAlbumTagCount = jest
  .fn()
  .mockImplementation(
    (albumName: string, artistName: string, tagName: string) => {
      if (artistName === 'Exodus' && tagName === 'thrash metal') {
        return Promise.resolve(100);
      }
      return Promise.resolve(0);
    },
  );

export default getAlbumTagCount;
