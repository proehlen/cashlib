// @flow

declare var describe: any;
declare var test: any;
declare var expect: any;

const Cache = require('../lib/Cache').default;

describe('Cache', () => {
  const maxSize = 2;
  const cache: Cache<string, number> = new Cache(maxSize);
  const RED = 0xFF0000;
  const GREEN = 0x00FF00;
  const BLUE = 0x0000FF;

  test('Values can be added', () => {
    cache.add('blue', BLUE);
  });
  test('Values can be retrieved', () => {
    const value = cache.get('blue');
    expect(value).toEqual(BLUE);
  });
  test('Cache auto prunes if > max size', () => {
    cache.add('red', RED);
    cache.add('green', GREEN);
    expect(cache.size).toEqual(maxSize);
    expect(cache.get('blue')).toBeUndefined();
    expect(cache.get('red')).toEqual(RED);
    expect(cache.get('green')).toEqual(GREEN);
  });

  test('Cache prunes based on age of last access', () => {
    // Last test should have left cache with 'red' and then 'green'
    // in cache as oldest and most recent entries respectively.
    // Ordinarily, 'red' would be pruned next but if we access it
    // then 'green' becomes the oldest.
    cache.get('red');
    cache.add('blue', BLUE);
    expect(cache.size).toEqual(maxSize);
    expect(cache.get('green')).toBeUndefined();
    expect(cache.get('red')).toEqual(RED);
    expect(cache.get('blue')).toEqual(BLUE);
  });
});
