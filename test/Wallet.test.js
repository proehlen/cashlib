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
      const seed = wallet.seed.hex;
      // expect(seed).toEqual('xprv9s21ZrQH143K3Y5Tc11smGi6MycGZ5wCcEVP2Qdt1gDeXpT4ujyHsEDwhxCqkVgcmzGf9dJGeSDWocwKj8QWvZ87Er7sKFS69ReQm5f2ram')
      expect(seed).toEqual('5A067DAAB7E5A157AB20E66870AA7B0AD28C91A97344D555D54EE406EAD53F88FE246291362B99B97B7F6C9C627CED671B0155F06E99D2EB7C885C3974585E36');

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