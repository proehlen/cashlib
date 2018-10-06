// @flow

declare var describe: any;
declare var test: any;
declare var expect: any;

const fromBytes = require('stringfu').fromBytes;
const Wallet = require('../lib/Wallet').default;

describe('Wallet', () => {
  describe('#constructor', () => {
    test('Invalid number of words should fail', () => {
      const createWallet = () => new Wallet(['abandon', 'ability', 'able']);
      expect(createWallet).toThrow('seed words');
    });
    test('Invalid words should fail', () => {
      const createWallet = () => new Wallet([
        'abandon',
        'ability',
        'able',
        'about',
        'above',
        'absents',  // misspelled
        'absorb',
        'abstract',
        'absurd',
        'abuse',
        'access',
        'accident',
      ]);
      expect(createWallet).toThrow('not in the word list');
    });
    test('Valid words should succeed', () => {
      const wallet = new Wallet(['caution', 'polar', 'pottery', 'envelope', 'west', 'there', 'car', 'congress', 'bird', 'rare', 'genius', 'model']);
      expect(wallet).toBeDefined();
      const seed = wallet.seed.toHex();
      // expect(seed).toEqual('xprv9s21ZrQH143K3Y5Tc11smGi6MycGZ5wCcEVP2Qdt1gDeXpT4ujyHsEDwhxCqkVgcmzGf9dJGeSDWocwKj8QWvZ87Er7sKFS69ReQm5f2ram')
      expect(seed).toEqual('5a067daab7e5a157ab20e66870aa7b0ad28c91a97344d555d54ee406ead53f88fe246291362b99b97b7f6c9c627ced671b0155f06e99d2eb7c885c3974585e36');

    });
    // // TODO implement checksum check
    // test('Invalid checksum word should fail', () => {
    //   const createWallet = () => new Wallet([
    //     'abandon',
    //     'ability',
    //     'able',
    //     'about',
    //     'above',
    //     'absent',
    //     'absorb',
    //     'abstract',
    //     'absurd',
    //     'abuse',
    //     'access',
    //     'accident', // Not a valid checksum
    //   ]);
    //   expect(createWallet).toThrow('invalid checksum');
    // });

  });
});