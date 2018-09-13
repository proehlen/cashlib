// @flow

declare var describe: any;
declare var test: any;
declare var expect: any;

const Serializer = require('../lib/Serializer').default;

describe('Serializer', () => {
  describe('#addCompactSize', () => {
    test('Uint8', () => {
      const serializer = new Serializer();
      serializer.addCompactSize(232);
      expect(serializer.hex).toEqual('e8');
    });
    test('Uint16', () => {
      const serializer = new Serializer();
      serializer.addCompactSize(32767);
      expect(serializer.hex).toEqual('fdff7f');
    });
    test('Uint32', () => {
      const serializer = new Serializer();
      serializer.addCompactSize(4294967295);
      expect(serializer.hex).toEqual('feffffffff');
    });
    // test('Uint64', () => {
    //   const serializer = new Serializer();
    //   serializer.addCompactSize(2100000000000000);
    //   expect(serializer.hex).toEqual('ff0040075af0750700');
    // });
  });
  describe('#addInt64', () => {
    test('0', () => {
      const serializer = new Serializer();
      serializer.addInt64(0);
      expect(serializer.hex).toEqual('0000000000000000');
    });
    test('1', () => {
      const serializer = new Serializer();
      serializer.addInt64(1);
      expect(serializer.hex).toEqual('0100000000000000');
    });
    test('-1', () => {
      const serializer = new Serializer();
      serializer.addInt64(-1);
      expect(serializer.hex).toEqual('ffffffffffffffff');
    });
    test('1000', () => {
      const serializer = new Serializer();
      serializer.addInt64(1000);
      expect(serializer.hex).toEqual('e803000000000000');
    });
    test('-1000', () => {
      const serializer = new Serializer();
      serializer.addInt64(-1000);
      expect(serializer.hex).toEqual('18fcffffffffffff');
    });
    test('21 million sats', () => {
      const serializer = new Serializer();
      serializer.addInt64(2100000000000000);
      expect(serializer.hex).toEqual('0040075af0750700');
    });
    test('-21 million sats', () => {
      const serializer = new Serializer();
      serializer.addInt64(-2100000000000000);
      expect(serializer.hex).toEqual('00c0f8a50f8af8ff');
    });
    test('MIN_SAFE_INTEGER', () => {
      const serializer = new Serializer();
      serializer.addInt64(Number.MIN_SAFE_INTEGER);
      expect(serializer.hex).toEqual('010000000000e0ff');
    });
    test('MAX_SAFE_INTEGER', () => {
      const serializer = new Serializer();
      serializer.addInt64(Number.MAX_SAFE_INTEGER);
      expect(serializer.hex).toEqual('ffffffffffff1f00');
    });
  });
});