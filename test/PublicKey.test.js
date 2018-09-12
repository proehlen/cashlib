// @flow

declare var describe: any;
declare var test: any;
declare var expect: any;

const PublicKey = require('../lib/PublicKey').default;
const PrivateKey = require('../lib/PrivateKey').default;

describe('PublicKey', () => {
  describe('From private key', () => {
    const privateKeyString = '1184CD2CDD640CA42CFC3A091C51D549B2F016D454B2774019C2B2D2E08529FD';
    const publicKeyString = '04D0988BFA799F7D7EF9AB3DE97EF481CD0F75D2367AD456607647EDDE665D6F6FBDD594388756A7BEAF73B4822BC22D36E9BDA7DB82DF2B8B623673EEFC0B7495';
    let publicKey: PublicKey;
    test('#constructor', () => {
      const privateKey = PrivateKey.fromHex(privateKeyString);
      publicKey = PublicKey.fromPrivateKey(privateKey);
      expect(publicKey).toBeDefined();
    });
    test('#toHex', () => {
      const returnedString = publicKey.toHex();
      expect(returnedString).toEqual(publicKeyString);
    });
  });
});