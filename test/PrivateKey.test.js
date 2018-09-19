// @flow

declare var describe: any;
declare var test: any;
declare var expect: any;

const PrivateKey = require('../lib/PrivateKey').default;
const { regtest, mainnet } = require('../lib/networks');

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
});