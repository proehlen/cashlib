// @flow

declare var describe: any;
declare var test: any;
declare var expect: any;

const DerivationPath = require('../lib/Wallet/DerivationPath').default;
const Network = require('../lib/Network').default;
const network = Network.fromString('mainnet');
let pathString: string;

describe('DerivationPath', () => {
  describe('Decoding', () => {
    pathString = 'm';
    describe(pathString, () => {
      const path = new DerivationPath(pathString);
      const levels = path.levels;
      test('is type private', () => {
        expect(path.type).toEqual('private');
      });
      test('has 0 levels', () => {
        expect(levels.length).toEqual(0);
      });
    });

    pathString = 'M';
    describe(pathString, () => {
      const path = new DerivationPath(pathString);
      const levels = path.levels;
      test('is type public', () => {
        expect(path.type).toEqual('public');
      });
      test('has 0 levels', () => {
        expect(levels.length).toEqual(0);
      });
    });

    pathString = 'm/0';
    describe(pathString, () => {
      const path = new DerivationPath(pathString);
      const levels = path.levels;
      test('is type private', () => {
        expect(path.type).toEqual('private');
      });
      test('has 1 levels', () => {
        expect(levels.length).toEqual(1);
      });
      test('level 1 is decoded correctly', () => {
        const level1 = levels[0];
        expect(level1.depth).toEqual(1);
        expect(level1.childNumber).toEqual(0);
        expect(level1.hardened).toEqual(false);
      });
    });

    pathString = "M/5'/3";
    describe(pathString, () => {
      const path = new DerivationPath(pathString);
      const levels = path.levels;
      test('is type public', () => {
        expect(path.type).toEqual('public');
      });
      test('has 2 levels', () => {
        expect(levels.length).toEqual(2);
      });
      test('level 1 is decoded correctly', () => {
        const level1 = levels[0];
        expect(level1.depth).toEqual(1);
        expect(level1.childNumber).toEqual(5);
        expect(level1.hardened).toEqual(true);
      });
      test('level 2 is decoded correctly', () => {
        const level2 = levels[1];
        expect(level2.depth).toEqual(2);
        expect(level2.childNumber).toEqual(3);
        expect(level2.hardened).toEqual(false);
      });
    });
  });
  describe('DerivationPath.levels is immutable', () => {
    const path = new DerivationPath("M/5'/3");
    let levels = path.levels;
    levels[0].childNumber = 6;
    levels.pop();
    levels = path.levels;
    expect(levels.length).toEqual(2);
    expect(levels[0].childNumber).toEqual(5);
  });
});