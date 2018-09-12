// @flow

import Deserializer from './Deserializer';
import Input from './Input';

export default class Transaction {
  _version: number
  _inputs: Input[]

  constructor (version: number = 1) {
    this._version = version;
    this._inputs = [];
  }

  addInput(input: Input) {
    this._inputs.push(input);
  }

  static fromHex(raw: string) : Transaction {

    // Initialize data view
    const bytes = new Deserializer(raw);

    // Get tx version and create new Transaction instance
    const version = bytes.getUint32();
    const transaction = new Transaction(version);

    // Get transaction inputs
    const txInCount = bytes.getCompactSize();
    for (let inputIndex = 0; inputIndex < txInCount; ++inputIndex) {
      const utxoTxId = bytes.getData(32);
      const utxoIndex = bytes.getUint32();
      const scriptBytesLength = bytes.getCompactSize();
      const signatureScript = bytes.getData(scriptBytesLength);
      const sequence = bytes.getUint32();

      const input = new Input(utxoTxId, utxoIndex, signatureScript);
      transaction.addInput(input);
    }
      
    // Get transaction outputs
    const txOutCount = bytes.getCompactSize();
    for (let outputIndex = 0; outputIndex < txOutCount; ++outputIndex) {
      const value = bytes.getSatoshis();
      const pubkeyScriptBytesLen = bytes.getCompactSize();
      const pubKeyScript = bytes.getData(pubkeyScriptBytesLen);
    }

    // Get locktime
    const lockTime = bytes.getUint32();
      
    return new Transaction();
  }

  toHex(): string {
    // return Buffer.from(this._bytes.buffer).toString('hex').toUpperCase();
    return 'XXXX';
  }
}