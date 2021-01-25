const getArtistTopTags = jest.fn().mockImplementation((artistName: string) => {
  if (artistName === 'Exodus') {
    return Promise.resolve([
      {
        count: 100,
        name: 'thrash metal',
      },
      { count: 19, name: 'metal' },
      {
        count: 19,
        name: 'speed metal',
      },
    ]);
  }
  return Promise.resolve([]);
});

export default getArtistTopTags;
