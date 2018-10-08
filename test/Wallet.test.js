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
      const wallet = Wallet.fromSeed(Data.fromHex(seedHex));
      describe('Chain m', () => {
        test('Master Public Key', () => {
          const xpub = wallet.getMasterPublicKey().toSerialized(network);
          expect(xpub).toEqual('xpub661MyMwAqRbcFtXgS5sYJABqqG9YLmC4Q1Rdap9gSE8NqtwybGhePY2gZ29ESFjqJoCu1Rupje8YtGqsefD265TMg7usUDFdp6W1EGMcet8');
        });
        test('Master Private Key', () => {
          const xpriv = wallet.getMasterPrivateKey().toSerialized(network);
          expect(xpriv).toEqual('xprv9s21ZrQH143K3QTDL4LXw2F7HEK3wJUD2nW2nRk4stbPy6cq3jPPqjiChkVvvNKmPGJxWUtg6LnF5kejMRNNU3TGtRBeJgk33yuGBxrMPHi');
        });
      });
    });
    describe('Test Vector 2', () => {
      const seedHex = 'fffcf9f6f3f0edeae7e4e1dedbd8d5d2cfccc9c6c3c0bdbab7b4b1aeaba8a5a29f9c999693908d8a8784817e7b7875726f6c696663605d5a5754514e4b484542';
      const wallet = Wallet.fromSeed(Data.fromHex(seedHex));
      describe('Chain m', () => {
        test('Master Public Key', () => {
          const xpub = wallet.getMasterPublicKey().toSerialized(network);
          expect(xpub).toEqual('xpub661MyMwAqRbcFW31YEwpkMuc5THy2PSt5bDMsktWQcFF8syAmRUapSCGu8ED9W6oDMSgv6Zz8idoc4a6mr8BDzTJY47LJhkJ8UB7WEGuduB');
        });
        test('Master Private Key', () => {
          const xpriv = wallet.getMasterPrivateKey().toSerialized(network);
          expect(xpriv).toEqual('xprv9s21ZrQH143K31xYSDQpPDxsXRTUcvj2iNHm5NUtrGiGG5e2DtALGdso3pGz6ssrdK4PFmM8NSpSBHNqPqm55Qn3LqFtT2emdEXVYsCzC2U');
        });
      });
    });
    describe('Test Vector 3', () => {
      const seedHex = '4b381541583be4423346c643850da4b320e46a87ae3d2a4e6da11eba819cd4acba45d239319ac14f863b8d5ab5a0d0c64d2e8a1e7d1457df2e5a3c51c73235be';
      const wallet = Wallet.fromSeed(Data.fromHex(seedHex));
      describe('Chain m', () => {
        test('Master Public Key', () => {
          const xpub = wallet.getMasterPublicKey().toSerialized(network);
          expect(xpub).toEqual('xpub661MyMwAqRbcEZVB4dScxMAdx6d4nFc9nvyvH3v4gJL378CSRZiYmhRoP7mBy6gSPSCYk6SzXPTf3ND1cZAceL7SfJ1Z3GC8vBgp2epUt13');
        });
        test('Master Private Key', () => {
          const xpriv = wallet.getMasterPrivateKey().toSerialized(network);
          expect(xpriv).toEqual('xprv9s21ZrQH143K25QhxbucbDDuQ4naNntJRi4KUfWT7xo4EKsHt2QJDu7KXp1A3u7Bi1j8ph3EGsZ9Xvz9dGuVrtHHs7pXeTzjuxBrCmmhgC6');
        });
      });
    });

    // describe('TODO - REMOVE THIS DUMMY TEST', () => {
    //   const seedHex = 'fffcf9f6f3f0edeae7e4e1dedbd8d5d2cfccc9c6c3c0bdbab7b4b1aeaba8a5a29f9c999693908d8a8784817e7b7875726f6c696663605d5a5754514e4b484542';
    //   const wallet = Wallet.fromSeed(Data.fromHex(seedHex));
    //   describe('test', () => {
    //     test('test', () => {
    //       const xpriv = wallet._derivePrivateChildFromPrivate(
    //         wallet.getMasterPrivateKey(),
    //         0
    //       ).toSerialized(network);
    //       expect(xpriv).toEqual('xprv9vHkqa6EV4sPZHYqZznhT2NPtPCjKuDKGY38FBWLvgaDx45zo9WQRUT3dKYnjwih2yJD9mkrocEZXo1ex8G81dwSM1fwqWpWkeS3v86pgKt');
    //     });
    //   });
    // });
  });
});