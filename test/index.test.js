/**
 * Test entry point to library
 *
 * The purpose is mostly to test that initial require() doesn't fail due to
 * refactoring/moving of classes and the index.js file not being updated
 * (that problem isn't picked up by other tests.)  The 'toBeDefined' tests
 * are mostly redundant but JEST expects something to be tested or throws error.
 *
 * A failure here will serve as a warning that the public interface to the
 * library has changed after we are stable (requiring major version bump).
 */
// @flow

const cashlib = require('../lib');

declare var describe: any;
declare var test: any;
declare var expect: any;

describe('Library (index.js)', () => {
  describe('objects are provided', () => {
    test('Address', () => {
      expect(cashlib.Address).toBeDefined();
    });
    test('Input', () => {
      expect(cashlib.Input).toBeDefined();
    });
    test('MnemonicSeed', () => {
      expect(cashlib.MnemonicSeed).toBeDefined();
    });
    test('Network', () => {
      expect(cashlib.Network).toBeDefined();
    });
    test('OpCode', () => {
      expect(cashlib.OpCode).toBeDefined();
    });
    test('opCodes', () => {
      expect(cashlib.opCodes).toBeDefined();
    });
    test('Output', () => {
      expect(cashlib.Output).toBeDefined();
    });
    test('PrivateKey', () => {
      expect(cashlib.PrivateKey).toBeDefined();
    });
    test('PublicKey', () => {
      expect(cashlib.PublicKey).toBeDefined();
    });
    test('Transaction', () => {
      expect(cashlib.Transaction).toBeDefined();
    });
    test('Wallet', () => {
      expect(cashlib.Wallet).toBeDefined();
    });
  });
});
