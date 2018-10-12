/**
 * Test against 'official' BIP32 test vectors 
 * 
 * https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki#Test_Vectors
 */
// @flow

declare var describe: any;
declare var test: any;
declare var expect: any;

const Data = require('../lib/Data').default;
const DerivationPath = require('../lib/Wallet/DerivationPath').default;
const Network = require('../lib/Network').default;
const Wallet = require('../lib/Wallet').default;
const bip32TestVectors = require('./bip32/testVectors');

describe('Wallet', () => {
  describe('mainnet', () => {
    const network = Network.fromString('mainnet');
    describe('BIP-0032 Test Vectors', () => {
      for (let vector of bip32TestVectors) {
        describe(`Test ${vector.id}`, () => {
          const wallet = Wallet.fromSeed(Data.fromHex(vector.seedHex));
          for (let chain of vector.chains) {
            test(`Path ${chain.path}`, () => {
              const path = DerivationPath.fromSerialized(chain.path);
              const derivedKey = wallet.getKey(path).toSerialized(network);
              expect(derivedKey).toBe(chain.key);
            });
          }
        });
      }
    });
  });
});