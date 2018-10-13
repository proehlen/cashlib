// @flow

declare var describe: any;
declare var test: any;
declare var expect: any;

const Deserializer = require('../lib/Deserializer').default;

describe('Deserializer', () => {
  describe('#getCompactSize', () => {
    test('Uint8', () => {
      const data = new Uint8Array([
        0xe8,
      ]);
      const deserializer = new Deserializer(data);
      const value = deserializer.getCompactSize();
      expect(value).toEqual(232);
    });
    test('Uint16', () => {
      const data = new Uint8Array([
        0xfd, 0xff, 0x7f,
      ]);
      const deserializer = new Deserializer(data);
      const value = deserializer.getCompactSize();
      expect(value).toEqual(32767);
    });
    test('Uint32', () => {
      const data = new Uint8Array([
        0xfe, 0xff, 0xff, 0xff, 0xff,
      ]);
      const deserializer = new Deserializer(data);
      const value = deserializer.getCompactSize();
      expect(value).toEqual(4294967295);
    });
    test('Uint64', () => {
      const data = new Uint8Array([
        0xff, 0x01, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00,
      ]);
      const deserializer = new Deserializer(data);
      const value = deserializer.getCompactSize();
      expect(value).toEqual(4294967297);
    });
  });
  describe('#getInt64', () => {
    test('0', () => {
      const deserializer = new Deserializer('0000000000000000');
      const value = deserializer.getInt64();
      expect(value).toEqual(0);
    });
    test('1', () => {
      const deserializer = new Deserializer('0100000000000000');
      const value = deserializer.getInt64();
      expect(value).toEqual(1);
    });
    test('-1', () => {
      const deserializer = new Deserializer('ffffffffffffffff');
      const value = deserializer.getInt64();
      expect(value).toEqual(-1);
    });
    test('1000', () => {
      const deserializer = new Deserializer('e803000000000000');
      const value = deserializer.getInt64();
      expect(value).toEqual(1000);
    });
    test('-1000', () => {
      const deserializer = new Deserializer('18fcffffffffffff');
      const value = deserializer.getInt64();
      expect(value).toEqual(-1000);
    });
    test('21 million sats', () => {
      const deserializer = new Deserializer('0040075af0750700');
      const value = deserializer.getInt64();
      expect(value).toEqual(2100000000000000);
    });
    test('-21 million sats', () => {
      const deserializer = new Deserializer('00c0f8a50f8af8ff');
      const value = deserializer.getInt64();
      expect(value).toEqual(-2100000000000000);
    });
    test('MIN_SAFE_INTEGER', () => {
      const data = new Uint8Array([
        0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0xe0, 0xff,
      ]);
      const deserializer = new Deserializer(data);
      const value = deserializer.getInt64();
      expect(value).toEqual(Number.MIN_SAFE_INTEGER);
    });
    test('MAX_SAFE_INTEGER', () => {
      const data = new Uint8Array([
        0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x1f, 0x00,
      ]);
      const deserializer = new Deserializer(data);
      const value = deserializer.getInt64();
      expect(value).toEqual(Number.MAX_SAFE_INTEGER);
    });
    test('MIN_SAFE_INTEGER - 1 throws exception', () => {
      const data = new Uint8Array([
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xe0, 0xff,
      ]);
      const deserializer = new Deserializer(data);
      expect(() => deserializer.getInt64()).toThrow('safe range');
    });
    test('MAX_SAFE_INTEGER + 1 throws exception', () => {
      const data = new Uint8Array([
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x20, 0x00,
      ]);
      const deserializer = new Deserializer(data);
      expect(() => deserializer.getInt64()).toThrow('safe range');
    });
  });
});
