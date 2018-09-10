// @flow

declare var describe: any;
declare var test: any;
declare var expect: any;

const Deserializer = require('../lib/Deserializer').default;

describe('Deserializer', () => {
  describe('#getSatoshis', () => {
    test('1000', () => {
      const data = new Uint8Array([
        0xe8, 0x03, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
      ]);
      const deserializer = new Deserializer(data);
      const value = deserializer.getSatoshis();
      expect(value).toEqual(1000);
    });
    test('-1000', () => {
      const data = new Uint8Array([
        0x18, 0xfc, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff
      ]);
      const deserializer = new Deserializer(data);
      expect(() => deserializer.getSatoshis()).toThrow('Negative');
    });
  });
});