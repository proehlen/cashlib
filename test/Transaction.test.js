// @flow

declare var describe: any;
declare var test: any;
declare var expect: any;

const Transaction = require('../lib/Transaction').default;

describe('Transaction', () => {
  describe('Raw', () => {
    let transaction: Transaction;
    let hexString = '01000000015cebfb74f32ddfcee39aef7d4a5ead5489bb83bc3554203cc343dbe081113fe9000000006b483045022100e9df5adb41a207ed9a12b8a5a5f002a44beb2e8a72b0b613de6a63c9269d32420220418159917ecc7b6bb764ded1a97b5f682bb78ae9c4664d12417800ff9281e44941210307365f7f2d92cf595dfc163c29712daaadb7bca827403ea74ba87d893e8be1cbfeffffff02b8c0fe00000000001976a914b8f763ed9923edfa0f8adf5512ce62978819a27288ac201efc01000000001976a914373e5431d04e79aa1435923f68efb4e4be69aa8188ac6d000000';
    test('#fromHexString', () => {
      transaction = Transaction.fromHexString(hexString);
      expect(transaction).toBeDefined();
    });
    test('#toHexString', () => {
      const returnedString = transaction.toHexString();
      expect(returnedString).toEqual(hexString);
    });
  });
});