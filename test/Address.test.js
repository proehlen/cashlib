// @flow

declare var describe: any;
declare var test: any;
declare var expect: any;

const PublicKey = require('../lib/PublicKey').default;
const PrivateKey = require('../lib/PrivateKey').default;
const Address = require('../lib/Address').default;
const { regtest, testnet, mainnet } = require('../lib/networks');

describe('Address', () => {
  describe('mainnet', () => {
    const network = mainnet;
    describe('From private key', () => {
      const privateKeyString = '1184CD2CDD640CA42CFC3A091C51D549B2F016D454B2774019C2B2D2E08529FD';
      const btcAddress = '16UjcYNBG9GTK4uq2f7yYEbuifqCzoLMGS';
      const privateKey = PrivateKey.fromHex(privateKeyString);
      const publicKey = PublicKey.fromPrivateKey(privateKey);
      let address: Address;
      test('#fromPublicKey', () => {
        address = Address.fromPublicKey(publicKey, network);
        expect(publicKey).toBeDefined();
      });
      test('#toString', () => {
        const returnedString = address.toString();
        expect(returnedString).toEqual(btcAddress);
      });
    });
    describe('From public key (string)', () => {
      const publicKeyString = '03919f9806cd4d07b588b14bcf7f5e8466d1c59f3694eb24101bbf59b91f933bfa';
      const btcAddress = '1KHL3He8D171NX8MpLH4XGsBqBjMmEDrHC';
      const publicKey = PublicKey.fromString(publicKeyString);
      let address: Address;
      test('#fromPublicKey', () => {
        address = Address.fromPublicKey(publicKey, network);
        expect(publicKey).toBeDefined();
      });
      test('#toString', () => {
        const returnedString = address.toString();
        expect(returnedString).toEqual(btcAddress);
      });
    });
    describe('From private key (wif)', () => {
      const privateKeyWif = 'L3V4PApewZJ4GfNpsPeGiTKqpjHhtaDueWAFBf6VVDzK7FPkvyZB';
      const btcAddress = '1EpvxkfKFjU5PK5ddBiEBkZYN1cWq67QJE';
      const privateKey = PrivateKey.fromWif(privateKeyWif);
      const publicKey = PublicKey.fromPrivateKey(privateKey);
      let address: Address;
      test('#fromPublicKey', () => {
        address = Address.fromPublicKey(publicKey, network);
        expect(publicKey).toBeDefined();
      });
      test('#toString', () => {
        const returnedString = address.toString();
        expect(returnedString).toEqual(btcAddress);
      });
    });
  });
  describe('testnet', () => {
    describe('BU generated key / address', () => {
      const network = testnet;
      describe('From public key (string)', () => {
        const publicKeyString = '03919f9806cd4d07b588b14bcf7f5e8466d1c59f3694eb24101bbf59b91f933bfa';
        const btcAddress = 'myoHLLj722YG9dbyXuFSMC5WhBL4h7nqhs';
        const publicKey = PublicKey.fromString(publicKeyString);
        let address: Address;
        test('#fromPublicKey', () => {
          address = Address.fromPublicKey(publicKey, network);
          expect(publicKey).toBeDefined();
        });
        test('#toString', () => {
          const returnedString = address.toString();
          expect(returnedString).toEqual(btcAddress);
        });
      });
      describe('From private key (wif)', () => {
        const privateKeyWif = 'cRQgJ4UoTUUQqueDHmDmUCSKimqVzRiAGss4FoEfpaJxNFbMrRvk';
        const btcAddress = 'mtnWoEQRvAHm6BzmE3zwveU593QC1xTbVi';
        const privateKey = PrivateKey.fromWif(privateKeyWif);
        const publicKey = PublicKey.fromPrivateKey(privateKey);
        let address: Address;
        test('#fromPublicKey', () => {
          address = Address.fromPublicKey(publicKey, network);
          expect(publicKey).toBeDefined();
        });
        test('#toString', () => {
          const returnedString = address.toString();
          expect(returnedString).toEqual(btcAddress);
        });
      });
    });
    describe('Electron Cash generated key / address', () => {
      const network = testnet;
      describe('From private key (wif)', () => {
        const privateKeyWif = 'cUdCUwAa3QX1GEzUnQWY6yzb7NXNKypMnD4JtpCxzNurmD3mx2NY';
        const btcAddress = 'muHpKNJfDSDWUEc5f3YbSYbR9toAV1sfqt';
        const privateKey = PrivateKey.fromWif(privateKeyWif);
        const publicKey = PublicKey.fromPrivateKey(privateKey);
        let address: Address;
        test('#fromPublicKey', () => {
          address = Address.fromPublicKey(publicKey, network);
          expect(publicKey).toBeDefined();
        });
        test('#toString', () => {
          const returnedString = address.toString();
          expect(returnedString).toEqual(btcAddress);
        });
      });
    });
  });
  describe('regtest', () => {
    const network = regtest;
    describe('From private key (wif)', () => {
      const privateKeyWif = 'cSF9RZbPkkpt1ShowJ3rgkLj8gv4goujzfS7x7Aw4BiuQRkraxcW';
      const btcAddress = 'mgyMRHuyCMjDwFK5eg3qjJBPgduBnPL1hK';
      const privateKey = PrivateKey.fromWif(privateKeyWif);
      const publicKey = PublicKey.fromPrivateKey(privateKey);
      let address: Address;
      test('#fromPublicKey', () => {
        address = Address.fromPublicKey(publicKey, network);
        expect(publicKey).toBeDefined();
      });
      test('#toString', () => {
        const returnedString = address.toString();
        expect(returnedString).toEqual(btcAddress);
      });
    });
  });
});