// @flow

declare var describe: any;
declare var test: any;
declare var expect: any;

const MnemonicSeed = require('../lib/MnemonicSeed').default;

describe('MnemonicSeed', () => {
  describe('#constructor', () => {
    test('Invalid number of words should fail', () => {
      const createMnemonicSeed = () => MnemonicSeed.fromWords(['abandon', 'ability', 'able']);
      expect(createMnemonicSeed).toThrow('seed words');
    });
    test('Invalid words should fail', () => {
      const createMnemonicSeed = () => MnemonicSeed.fromWords([
        'abandon',
        'ability',
        'able',
        'about',
        'above',
        'absents', // misspelled
        'absorb',
        'abstract',
        'absurd',
        'abuse',
        'access',
        'accident',
      ]);
      expect(createMnemonicSeed).toThrow('not in the word list');
    });
    test('Valid words should succeed', () => {
      const mnemonicSeed = MnemonicSeed.fromWords(['caution', 'polar', 'pottery', 'envelope', 'west', 'there', 'car', 'congress', 'bird', 'rare', 'genius', 'model']);
      expect(mnemonicSeed).toBeDefined();
      const seed = mnemonicSeed.toHex();
      expect(seed).toEqual('5a067daab7e5a157ab20e66870aa7b0ad28c91a97344d555d54ee406ead53f88fe246291362b99b97b7f6c9c627ced671b0155f06e99d2eb7c885c3974585e36');
    });
    // // TODO implement checksum check
    // test('Invalid checksum word should fail', () => {
    //   const createMnemonicSeed = () => MnemonicSeed.fromWords([
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
    //   expect(createMnemonicSeed).toThrow('invalid checksum');
    // });
  });
});
