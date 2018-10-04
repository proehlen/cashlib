// @flow

declare var describe: any;
declare var test: any;
declare var expect: any;

const toBytes = require('stringfu').toBytes;

const PrivateKey = require('../lib/PrivateKey').default;
const Network = require('../lib/Network').default;

const mainnet = Network.fromString('mainnet');
const regtest = Network.fromString('regtest');

describe('PrivateKey', () => {
  const keyString = '1184CD2CDD640CA42CFC3A091C51D549B2F016D454B2774019C2B2D2E08529FD';
  const wifString = '5Hx15HFGyep2CfPxsJKe2fXJsCVn5DEiyoeGGF6JZjGbTRnqfiD';
  describe('from hex', () => {
    let privateKey;
    test('#constructor', () => {
      privateKey = PrivateKey.fromHex(keyString);
      expect(privateKey).toBeDefined();
    });
    test('#toHex', () => {
      const returnedString = privateKey.hex;
      expect(returnedString).toEqual(keyString);
    });
    test('#toWif', () => {
      const returnedString = privateKey.toWif(mainnet);
      expect(returnedString).toEqual(wifString);
    });
  });
  describe('from wif', () => {
    let privateKey;
    test('#fromWif', () => {
      privateKey = PrivateKey.fromWif(wifString);
      expect(privateKey).toBeDefined();
    });
    test('#toHex', () => {
      const returnedString = privateKey.hex;
      expect(returnedString).toEqual(keyString);
    });
  });
  describe('#toPem', () => {
    const privateKeyString = '3cd0560f5b27591916c643a0b7aa69d03839380a738d2e912990dcc573715d2c';
    const privateKey = new PrivateKey(toBytes(privateKeyString));
    test('#toPem', () => {
      const returnedString = privateKey.toPem();
      const expected = 
        '-----BEGIN EC PRIVATE KEY-----\n' +
        'MC4CAQEEIDzQVg9bJ1kZFsZDoLeqadA4OTgKc40ukSmQ3MVzcV0soAcGBSuBBAAK\n' +
        '-----END EC PRIVATE KEY-----';
      expect(returnedString).toEqual(expected);
    });
  });
  describe('#sign', () => {
    // RPC equivalent of test: signmessage "mha3noC7oBSjMeLtc7zvy1QDNPTwvXRzKX" "Hello, World"
    const privateKey = PrivateKey.fromWif('cVVWDQDSHajpQGP9dnNf3QKoPGL9fjD6mRVJWMUqWDXMHdpfC43C');
    const result = privateKey.signMessage('Hello, World');
    expect(result).toEqual('HyDhcA0vNd0FlwG9W9EOXL0eQ99Lhgehmo8dMVVulUevCgw7eiiXkNpQM/5EowEmRk89M8MQc9nGOwVViQaWrBM=');
  });
});