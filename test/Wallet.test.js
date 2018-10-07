// @flow

declare var describe: any;
declare var test: any;
declare var expect: any;

const Data = require('../lib/Data').default;
const Network = require('../lib/Network').default;
const Wallet = require('../lib/Wallet').default;

describe('Wallet', () => {
  describe('BIP-0032 Test Vectors', () => {
    const network = Network.fromString('mainnet');
    describe('Test Vector 1', () => {
      const seedHex = '000102030405060708090a0b0c0d0e0f';
      const wallet = new Wallet(Data.fromHex(seedHex));
      test('Extended Private Key', () => {
        const xpriv = wallet._extendedPrivateKey.toSerialized(network);
        expect(xpriv).toEqual('xprv9s21ZrQH143K3QTDL4LXw2F7HEK3wJUD2nW2nRk4stbPy6cq3jPPqjiChkVvvNKmPGJxWUtg6LnF5kejMRNNU3TGtRBeJgk33yuGBxrMPHi');
      });
      test('Extended Public Key', () => {
        const xpub = wallet._extendedPublicKey.toSerialized(network);
        expect(xpub).toEqual('xpub661MyMwAqRbcFtXgS5sYJABqqG9YLmC4Q1Rdap9gSE8NqtwybGhePY2gZ29ESFjqJoCu1Rupje8YtGqsefD265TMg7usUDFdp6W1EGMcet8');
      });
    });
  });
});