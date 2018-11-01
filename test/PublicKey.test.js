// @flow

declare var describe: any;
declare var test: any;
declare var expect: any;

const PublicKey = require('../lib/PublicKey').default;
const PrivateKey = require('../lib/PrivateKey').default;

describe('PublicKey', () => {
  describe('From private key', () => {
    const privateKeyHex = '1184cd2cdd640ca42cfc3a091c51d549b2f016d454b2774019c2b2d2e08529fd';
    const publicKeyHex = '04d0988bfa799f7d7ef9ab3de97ef481cd0f75d2367ad456607647edde665d6f6fbdd594388756a7beaf73b4822bc22d36e9bda7db82df2b8b623673eefc0b7495';
    let publicKey: PublicKey;
    test('#constructor', () => {
      const privateKey = new PrivateKey(privateKeyHex);
      publicKey = PublicKey.fromPrivateKey(privateKey);
      expect(publicKey).toBeDefined();
    });
    test('#toHex', () => {
      const returnedString = publicKey.toHex();
      expect(returnedString).toEqual(publicKeyHex);
    });
  });
});
