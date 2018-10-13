// @flow

declare var describe: any;
declare var test: any;
declare var expect: any;

const AccountWallet = require('../lib/AccountWallet').default;
const DerivationPath = require('../lib/Wallet/DerivationPath').default;
const MnemonicSeed = require('../lib/MnemonicSeed').default;
const Network = require('../lib/Network').default;

describe('AccountWallet', () => {
  describe('Recreate Bitcoin.com wallet', () => {
    const mainnet = Network.fromString('mainnet');
    const testSeed = MnemonicSeed.fromWords('provide account trial post green artefact tumble exact bike margin right empower'.split(' '));
    const testPath = DerivationPath.fromSerialized("m/44'/0'/0'");
    const testExternalAddresses = [
      '13NZvMn8nZqPBawSkKpgQJdyWRnWAuGC2W',
      '1JoBnYeZYV4fmbuSDDYQpenH4p2aoRkGZD',
      '18ESo3CtLM2wWi3hWJuVGRUbPArHmotKJa',
    ];
    const testExternal19 = '12jh7iDi2hNpZ8P6gzFhJPkcNQfYLiKmrz';
    const testInternalAddresses = [
      '1Q1AnjjFecF3pGP82nvmtCwxgphkb16bit',
      '1G47D7xoX995qoY7paGxcwXExpjsB436ND',
      '1KfcwVXGxRaLD2jaREkRVG3HwUcCCejknB',
    ];
    const testInternal19 = '15xLgcHEUFYaZfxbwj2xoujTgBLjbeALpq';

    let wallet: AccountWallet;
    test('Construct from seed and derivation path', () => {
      wallet = AccountWallet.fromSeed(testSeed, testPath);
      expect(wallet).toBeDefined();
    });

    describe('Generates correct external addresses', () => {
      for (let i = 0; i < testExternalAddresses.length; i++) {
        const expectedAddress = testExternalAddresses[i];
        test(expectedAddress, () => {
          const address = wallet.nextExternalAddress(mainnet).toString();
          expect(address).toBe(expectedAddress);
        });
      }
    });

    describe('Generates correct internal addresses', () => {
      for (let i = 0; i < testInternalAddresses.length; i++) {
        const expectedAddress = testInternalAddresses[i];
        test(expectedAddress, () => {
          const address = wallet.nextInternalAddress(mainnet).toString();
          expect(address).toBe(expectedAddress);
        });
      }
    });

    describe('#setUsedAddressIndex', () => {
      describe('external', () => {
        test(`next address after 18 is ${testExternal19}`, () => {
          wallet.setUsedAddressIndex('external', 18);
          const address = wallet.nextExternalAddress(mainnet).toString();
          expect(address).toBe(testExternal19);
        });
      });

      describe('internal', () => {
        test(`next address after 18 is ${testInternal19}`, () => {
          wallet.setUsedAddressIndex('internal', 18);
          const address = wallet.nextInternalAddress(mainnet).toString();
          expect(address).toBe(testInternal19);
        });
      });
    });
  });
});
