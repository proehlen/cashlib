// @flow

declare var describe: any;
declare var test: any;
declare var expect: any;

const PublicKey = require('../lib/PublicKey').default;
const PrivateKey = require('../lib/PrivateKey').default;
const Address = require('../lib/Address').default;

describe('Address', () => {
  describe('From public key', () => {
    const privateKeyString = '1184CD2CDD640CA42CFC3A091C51D549B2F016D454B2774019C2B2D2E08529FD';
    const publicKeyString = '04D0988BFA799F7D7EF9AB3DE97EF481CD0F75D2367AD456607647EDDE665D6F6FBDD594388756A7BEAF73B4822BC22D36E9BDA7DB82DF2B8B623673EEFC0B7495';
    const btcAddress = '16UjcYNBG9GTK4uq2f7yYEbuifqCzoLMGS';
    const privateKey = PrivateKey.fromHex(privateKeyString);
    const publicKey = PublicKey.fromPrivateKey(privateKey);
    let address: Address;
    test('#fromPublicKey', () => {
      address = Address.fromPublicKey(publicKey);
      expect(publicKey).toBeDefined();
    });
    test('#toString', () => {
      const returnedString = address.toString();
      expect(returnedString).toEqual(btcAddress);
    });
  });
});