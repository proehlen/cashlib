// @flow

declare var describe: any;
declare var test: any;
declare var expect: any;

const Data = require('../lib/Data').default;
const DerivationPath = require('../lib/Wallet/DerivationPath').default;
const Network = require('../lib/Network').default;
const Wallet = require('../lib/Wallet').default;
const bip32TestVectors = require('./Wallet/bip32TestVectors');

describe('Wallet', () => {
  describe('mainnet', () => {
    const network = Network.fromString('mainnet');
    describe('BIP-0032 Test Vectors', () => {
      for (let vector of bip32TestVectors) {
        describe(`Test ${vector.id}`, () => {
          const wallet = Wallet.fromSeed(Data.fromHex(vector.seedHex));
          for (let chain of vector.chains) {
            test(`Path ${chain.path}`, () => {
              // if (chain.path === "M/0'") debugger;
              const path = DerivationPath.fromSerialized(chain.path);
              const derivedKey = wallet.getKey(path).toSerialized(network);
              expect(derivedKey).toBe(chain.key);
            });
          }
        });
      }
    });
    // TODO - remove this test when we are testing derivation paths which will include
    // testing the below function
    test('_derivePrivateChildFromPrivate', () => {
      const seedHex = 'fffcf9f6f3f0edeae7e4e1dedbd8d5d2cfccc9c6c3c0bdbab7b4b1aeaba8a5a29f9c999693908d8a8784817e7b7875726f6c696663605d5a5754514e4b484542';
      const wallet = Wallet.fromSeed(Data.fromHex(seedHex));
      const xpriv = wallet._derivePrivateChildFromPrivate(
        wallet.getMasterPrivateKey(),
        1,
        0,
      ).toSerialized(network);
      expect(xpriv).toEqual('xprv9vHkqa6EV4sPZHYqZznhT2NPtPCjKuDKGY38FBWLvgaDx45zo9WQRUT3dKYnjwih2yJD9mkrocEZXo1ex8G81dwSM1fwqWpWkeS3v86pgKt');
    });
    // TODO - remove this test when we are testing derivation paths which will include
    // testing the below function
    test('_derivePublicChildFromPrivate', () => {
      const seedHex = 'fffcf9f6f3f0edeae7e4e1dedbd8d5d2cfccc9c6c3c0bdbab7b4b1aeaba8a5a29f9c999693908d8a8784817e7b7875726f6c696663605d5a5754514e4b484542';
      const wallet = Wallet.fromSeed(Data.fromHex(seedHex));
      const xpub = wallet._derivePublicChildFromPrivate(
        wallet.getMasterPrivateKey(),
        1,
        0,
      ).toSerialized(network);
      expect(xpub).toEqual('xpub69H7F5d8KSRgmmdJg2KhpAK8SR3DjMwAdkxj3ZuxV27CprR9LgpeyGmXUbC6wb7ERfvrnKZjXoUmmDznezpbZb7ap6r1D3tgFxHmwMkQTPH');
    });
    // TODO - remove this test when we are testing derivation paths which will include
    // testing the below function
    test('_derivePublicChildFromPublic', () => {
      const seedHex = 'fffcf9f6f3f0edeae7e4e1dedbd8d5d2cfccc9c6c3c0bdbab7b4b1aeaba8a5a29f9c999693908d8a8784817e7b7875726f6c696663605d5a5754514e4b484542';
      const wallet = Wallet.fromSeed(Data.fromHex(seedHex));
      const xpub = wallet._derivePublicChildFromPublic(
        wallet.getMasterPublicKey(),
        1,
        0,
      ).toSerialized(network);
      expect(xpub).toEqual('xpub69H7F5d8KSRgmmdJg2KhpAK8SR3DjMwAdkxj3ZuxV27CprR9LgpeyGmXUbC6wb7ERfvrnKZjXoUmmDznezpbZb7ap6r1D3tgFxHmwMkQTPH');
    });
  });
});