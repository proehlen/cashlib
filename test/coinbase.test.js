// @flow

declare var describe: any;
declare var test: any;
declare var expect: any;

const Transaction = require('../lib/Transaction').default;

describe('Transaction', () => {
  describe('Deserialize/serialize', () => {
    describe('Coinbase', () => {
      let transaction: Transaction;
      const hex = '01000000010000000000000000000000000000000000000000000000000000000000000000ffffffff10016301010b2f454233322f414431322fffffffff01005039278c0400002321026868d210dc7b9a356928cf9fb3208e19d4c2baeb25627874db8bc9032817c344ac00000000';
      test('#fromHex', () => {
        transaction = Transaction.fromHex(hex);
        expect(transaction).toBeDefined();
      });
      test('#toHex', () => {
        const returnedString = transaction.hex;
        expect(returnedString).toEqual(hex);
      });
    });
  });
});