/**
 * HD Wallet tests.
 *
 * Note: BIP32 test vectors are tested in 'bip32.test.js'
 */
// @flow

declare var describe: any;
declare var test: any;
declare var expect: any;

const Data = require('../lib/Data').default;
const Network = require('../lib/Network').default;
const Wallet = require('../lib/Wallet').default;

describe('Wallet', () => {
  describe('mainnet', () => {
    const network = Network.fromString('mainnet');
    /**
     * Test deriving public child from public parent
     * (BIP32 function CKDpub((Kpar, cpar), i) → (Ki, ci))
     *
     * This method isn't actually tested in any of the BIP32 test vectors since
     * a) We have the seed hex for each chain (meaning we have the private extended key), and
     * b) our bip32 implementation optimizes to avoid calling this function if the private master
     *    key is available.
     *
     * TODO - we can remove this test when we are testing wallets that are instantiated with
     * only a public master key
     */
    test('_derivePublicChildFromPublic', () => {
      const seedHex = 'fffcf9f6f3f0edeae7e4e1dedbd8d5d2cfccc9c6c3c0bdbab7b4b1aeaba8a5a29f9c999693908d8a8784817e7b7875726f6c696663605d5a5754514e4b484542';
      const wallet = Wallet.fromSeed(new Data(seedHex));
      const xpub = wallet._derivePublicChildFromPublic(
        wallet.getMasterPublicKey(),
        1,
        0,
      ).toSerialized(network);
      expect(xpub).toEqual('xpub69H7F5d8KSRgmmdJg2KhpAK8SR3DjMwAdkxj3ZuxV27CprR9LgpeyGmXUbC6wb7ERfvrnKZjXoUmmDznezpbZb7ap6r1D3tgFxHmwMkQTPH');
    });
  });
});
