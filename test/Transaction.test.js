// @flow

declare var describe: any;
declare var test: any;
declare var expect: any;

const Transaction = require('../lib/Transaction').default;

describe('Transaction', () => {
  describe('Deserialize/serialize', () => {
    describe('Regtest', () => {
      describe('Minimal', () => {
        let transaction: Transaction;
        const hex = '01000000000000000000';
        test('#fromHex', () => {
          transaction = Transaction.deserialize(hex);
          expect(transaction).toBeDefined();
        });
        test('#getId', () => {
          expect(transaction.getId()).toEqual('d21633ba23f70118185227be58a63527675641ad37967e2aa461559f577aec43');
        });
        test('#toHex', () => {
          const returnedString = transaction.serialize();
          expect(returnedString).toEqual(hex);
        });
      });
      describe('Coinbase', () => {
        let transaction: Transaction;
        const hex = '01000000010000000000000000000000000000000000000000000000000000000000000000ffffffff10016301010b2f454233322f414431322fffffffff01005039278c0400002321026868d210dc7b9a356928cf9fb3208e19d4c2baeb25627874db8bc9032817c344ac00000000';
        test('#fromHex', () => {
          transaction = Transaction.deserialize(hex);
          expect(transaction).toBeDefined();
        });
        test('#isCoinbase', () => {
          expect(transaction.inputs[0].isCoinbase).toEqual(true);
        });
        test('#getId', () => {
          expect(transaction.getId()).toEqual('322b42d13b5187d09571cbbd09799dcef00ea266d73bae3d355cfdd210c1196f');
        });
        test('#toHex', () => {
          const returnedString = transaction.serialize();
          expect(returnedString).toEqual(hex);
        });
      });
      describe('Standard', () => {
        let transaction: Transaction;
        const hex = '01000000015cebfb74f32ddfcee39aef7d4a5ead5489bb83bc3554203cc343dbe081113fe9000000006b483045022100e9df5adb41a207ed9a12b8a5a5f002a44beb2e8a72b0b613de6a63c9269d32420220418159917ecc7b6bb764ded1a97b5f682bb78ae9c4664d12417800ff9281e44941210307365f7f2d92cf595dfc163c29712daaadb7bca827403ea74ba87d893e8be1cbfeffffff02b8c0fe00000000001976a914b8f763ed9923edfa0f8adf5512ce62978819a27288ac201efc01000000001976a914373e5431d04e79aa1435923f68efb4e4be69aa8188ac6d000000';
        test('#fromHex', () => {
          transaction = Transaction.deserialize(hex);
          expect(transaction).toBeDefined();
        });
        test('#getId', () => {
          expect(transaction.getId()).toEqual('b4b6e6ff6506a623510ca14625d15f6b183590b16c71b6264e3a451cd740e9ea');
        });
        test('#toHex', () => {
          const returnedString = transaction.serialize();
          expect(returnedString).toEqual(hex);
        });
      });
      describe('10 million sats', () => {
        let transaction: Transaction;
        const hex = '01000000012f0c7f4c056e0184b706afd6ae266a623180079bb39c1100050b96900618e64a010000006a473044022022270e1279d0b0ea586ea240d43e1cbbf51ce945719cede2d0b8def7d8f3ae5002203c64ff114c07f4fce6a07de645c04af7117de285e43193086c761f770cf01fa74121032b2ad86bbe5c76d14b63f718e6dfa6444135a834fcb30ed08906a974a49c7601feffffff02c0ba8a3cd56204001976a914443627edf15e9a4a634ebc8e2f6bbea0dfab13bc88acb3e21000000000001976a914f33955bc5d24f972a2d0da826093f4fe0d4c14cf88ac71020000';
        test('#fromHex', () => {
          transaction = Transaction.deserialize(hex);
          expect(transaction).toBeDefined();
        });
        test('#getId', () => {
          expect(transaction.getId()).toEqual('5c8f36b0a3588429d68854dc127077c73fdfe532d7a3a627fab5e5f3a9378840');
        });
        test('#toHex', () => {
          const returnedString = transaction.serialize();
          expect(returnedString).toEqual(hex);
        });
      });
      describe('1 sat', () => {
        let transaction: Transaction;
        const hex = '0100000001408837a9f3e5b5fa27a6a3d732e5df3fc7777012dc5488d6298458a3b0368f5c010000006a473044022014f2cfcffa45fa4821ffffc4b80bdcf54f8a52a4075796f8acb04f0f11540c4b0220027d8c4be61eff6d6ee829e0949fa2f6645ba144779864ea4547f5055f1669de412102f37d4c002ec772a60bdf9e3c574349c864507f2597a8c07bcf7b7a6fc253ad91feffffff020ad11000000000001976a914c4ce62e72807ca6861654276bfe772858db2bd9188ac01000000000000001976a9142ab1cc778d2ffc8a72d9cb730e5370c8d39d0bfe88ac72020000';
        test('#fromHex', () => {
          transaction = Transaction.deserialize(hex);
          expect(transaction).toBeDefined();
        });
        test('#getId', () => {
          expect(transaction.getId()).toEqual('2935c38689f801c1e2e4946871ebeaf0338c9b66aaa3eddfe02580a1e5e1636a');
        });
        test('#toHex', () => {
          const returnedString = transaction.serialize();
          expect(returnedString).toEqual(hex);
        });
      });
      describe('Negative sats (faked)', () => {
        // This tx is not real-world value but has been created to test  negative sat values
        // at the protocol level, the field is a signed integer
        let transaction: Transaction;
        const hex = '0100000001408837a9f3e5b5fa27a6a3d732e5df3fc7777012dc5488d6298458a3b0368f5c010000006a473044022014f2cfcffa45fa4821ffffc4b80bdcf54f8a52a4075796f8acb04f0f11540c4b0220027d8c4be61eff6d6ee829e0949fa2f6645ba144779864ea4547f5055f1669de412102f37d4c002ec772a60bdf9e3c574349c864507f2597a8c07bcf7b7a6fc253ad91feffffff020ad11000000000001976a914c4ce62e72807ca6861654276bfe772858db2bd9188ac01000000000000001976a9142ab1cc778d2ffc8a72d9cb730e5370c8d39d0bfe88ac72020000';
        test('#fromHex', () => {
          transaction = Transaction.deserialize(hex);
          expect(transaction).toBeDefined();
        });
        test('#getId', () => {
          expect(transaction.getId()).toEqual('2935c38689f801c1e2e4946871ebeaf0338c9b66aaa3eddfe02580a1e5e1636a');
        });
        test('#toHex', () => {
          const returnedString = transaction.serialize();
          expect(returnedString).toEqual(hex);
        });
      });
      describe('256 sats', () => {
        let transaction: Transaction;
        const hex = '01000000016a63e1e5a18025e0dfeda3aa669b8c33f0eaeb716894e4e2c101f88986c33529000000006b483045022100db134c69199448b938b29f0c5d48e472907b4d19d49368f320895617c8ae801f02202215b48d121f086ba6c62699d84bf01f2188dd1bbfef65059df495ead162f780412103dbb2d53c60e383e6947e8406a33094309a0d416b08293c18a06e97f44356863ffeffffff028eb51000000000001976a914eec4b04632e3e77af48c79e22a0c2b83095cf05b88ac00010000000000001976a9142ab1cc778d2ffc8a72d9cb730e5370c8d39d0bfe88ac72020000';
        test('#fromHex', () => {
          transaction = Transaction.deserialize(hex);
          expect(transaction).toBeDefined();
        });
        test('#getId', () => {
          expect(transaction.getId()).toEqual('c8132dda0f032d6d8add8f464970b9765f6653c4b54d6cbbe3d3c42919ce9837');
        });
        test('#toHex', () => {
          const returnedString = transaction.serialize();
          expect(returnedString).toEqual(hex);
        });
      });
    });
  });
  // describe('Signing', () => {
  //   describe ('One P2PKH input', () => {
  //     // JSON RPC command: signrawtransaction 0100000001c0867e779084c0425391bed6d41b885b54fe7fa6f39efd6b14344e77a93193ab0000000000feffffff01f0b9f505000000001976a91492a2e6c3d969b82eaccb304e980ef9b88f0a33d388ac00000000 "[{\"txid\":\"ab9331a9774e34146bfd9ef3a67ffe545b881bd4d6be915342c08490777e86c0\",\"vout\":0,\"scriptPubKey\":\"76a91416861640c5048caba2956ebe10c7e6c10169f2dd88ac\",\"amount\":0.99990000}]" "[\"cVVWDQDSHajpQGP9dnNf3QKoPGL9fjD6mRVJWMUqWDXMHdpfC43C\"]" 
  //     const rawUnsigned = '0100000001c0867e779084c0425391bed6d41b885b54fe7fa6f39efd6b14344e77a93193ab0000000000feffffff01f0b9f505000000001976a91492a2e6c3d969b82eaccb304e980ef9b88f0a33d388ac00000000';
  //     const rawSigned01 = '0100000001c0867e779084c0425391bed6d41b885b54fe7fa6f39efd6b14344e77a93193ab000000006b483045022100dbd3de2a42f5f7614e9bce6e27b2455d66afdf9e4cafdab7fcd03e1bf5f69d3502206810ad886b45fdb20d4991db04d025c33578641fe723a5543cad93f3842758dd412102ee61a342bcf6adc0ef0b7019db4ccb4b930a7d249ac54078eae43dfa72182788feffffff01f0b9f505000000001976a91492a2e6c3d969b82eaccb304e980ef9b88f0a33d388ac00000000';
  //     const rpcResult01 = '0100000001c0867e779084c0425391bed6d41b885b54fe7fa6f39efd6b14344e77a93193ab000000006b483045022100b9c1591c123f47aeb0d1bcd6bdda532a19f8cc76025e31c1defe5864586fec1f02206fc57c20e35c1d095b10a3fcf99ec50f07eb1bf7515b17ae31f66e3196108cfe412102ee61a342bcf6adc0ef0b7019db4ccb4b930a7d249ac54078eae43dfa72182788feffffff01f0b9f505000000001976a91492a2e6c3d969b82eaccb304e980ef9b88f0a33d388ac00000000';
  //     const rpcResult02 = '0100000001c0867e779084c0425391bed6d41b885b54fe7fa6f39efd6b14344e77a93193ab000000006b483045022100b9c1591c123f47aeb0d1bcd6bdda532a19f8cc76025e31c1defe5864586fec1f02206fc57c20e35c1d095b10a3fcf99ec50f07eb1bf7515b17ae31f66e3196108cfe412102ee61a342bcf6adc0ef0b7019db4ccb4b930a7d249ac54078eae43dfa72182788feffffff01f0b9f505000000001976a91492a2e6c3d969b82eaccb304e980ef9b88f0a33d388ac00000000';
  //     const rpcResult03 = '0100000001c0867e779084c0425391bed6d41b885b54fe7fa6f39efd6b14344e77a93193ab000000006b483045022100b9c1591c123f47aeb0d1bcd6bdda532a19f8cc76025e31c1defe5864586fec1f02206fc57c20e35c1d095b10a3fcf99ec50f07eb1bf7515b17ae31f66e3196108cfe412102ee61a342bcf6adc0ef0b7019db4ccb4b930a7d249ac54078eae43dfa72182788feffffff01f0b9f505000000001976a91492a2e6c3d969b82eaccb304e980ef9b88f0a33d388ac00000000';
  //     const rpcResult04 = '0100000001c0867e779084c0425391bed6d41b885b54fe7fa6f39efd6b14344e77a93193ab000000006a4730440220324685b190d94c6f4f740f809b1cba7d5e999dc179970956b7a54893e09725e602200216ee243dc6de4672b3b67f5cb9b4d62d6240c455fd532c5c9a76b67693a149432102ee61a342bcf6adc0ef0b7019db4ccb4b930a7d249ac54078eae43dfa72182788feffffff01f0b9f505000000001976a91492a2e6c3d969b82eaccb304e980ef9b88f0a33d388ac00000000'
      
  //     const privKey = PrivateKey.fromWif('cVVWDQDSHajpQGP9dnNf3QKoPGL9fjD6mRVJWMUqWDXMHdpfC43C');
  //     const transaction = Transaction.deserialize(rawUnsigned);
  //     const previousOutputs = [{
  //       transactionId: 'ab9331a9774e34146bfd9ef3a67ffe545b881bd4d6be915342c08490777e86c0',
  //       outputIndex: 0,
  //       output: new Output(100000000, toBytes('76a91416861640c5048caba2956ebe10c7e6c10169f2dd88ac')),
  //     }]
  //     transaction.signP2PKH(previousOutputs, privKey);
      
  //     test('Result', () => {
  //       const rawSigned = transaction.serialize();
  //       debugger
  //       expect(rawSigned).toEqual(rpcResult01);
  //       // expect(true).toEqual(true);
  //     });
  //   })
  // })
});