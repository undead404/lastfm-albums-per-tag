import assure from './assure';

describe('assure', () => {
  it('does not fail on empty input', () => {
    assure('wherever', {});
  });
  it('does not fail on meaningful input', () => {
    assure('wherever', { key: 'value' });
  });
  it('fails on falsy value', () => {
    try {
      assure('wherever', { key: '' });
    } catch (error) {
      expect(error).toHaveProperty('message', 'No key supplied to wherever');
    }
  });
  it('fails on mixed input value', () => {
    try {
      assure('wherever', { key: '', key2: 'value' });
    } catch (error) {
      expect(error).toHaveProperty('message', 'No key supplied to wherever');
    }
  });
});
