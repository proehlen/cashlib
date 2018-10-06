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
  const keyHex = '1184cd2cdd640ca42cfc3a091c51d549b2f016d454b2774019c2b2d2e08529fd';
  const wifString = '5Hx15HFGyep2CfPxsJKe2fXJsCVn5DEiyoeGGF6JZjGbTRnqfiD';
  const publicKeyHex = '04d0988bfa799f7d7ef9ab3de97ef481cd0f75d2367ad456607647edde665d6f6fbdd594388756a7beaf73b4822bc22d36e9bda7db82df2b8b623673eefc0b7495';
  describe('from hex', () => {
    let privateKey;
    test('#constructor', () => {
      privateKey = PrivateKey.fromHex(keyHex);
      expect(privateKey).toBeDefined();
    });
    test('#toHex', () => {
      const returnedString = privateKey.toHex();
      expect(returnedString).toEqual(keyHex);
    });
    test('#toWif', () => {
      const returnedString = privateKey.toWif(mainnet);
      expect(returnedString).toEqual(wifString);
    });
    test('#toPublicKey', () => {
      const pubKey = privateKey.toPublicKey();
      expect(pubKey.toHex()).toEqual(publicKeyHex);
    });
  });
  describe('from wif', () => {
    let privateKey;
    test('#fromWif', () => {
      privateKey = PrivateKey.fromWif(wifString);
      expect(privateKey).toBeDefined();
    });
    test('#toHex', () => {
      const returnedString = privateKey.toHex();
      expect(returnedString).toEqual(keyHex);
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

});