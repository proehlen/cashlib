// @flow

import Deserializer from './Deserializer';
import Input from './Input';
import Output from './Output';

export default class Transaction {
  _inputs: Input[]
  _outputs: Output[]
  _lockTime: number;

  constructor () {
    this._inputs = [];
    this._outputs = [];
    this._lockTime = 0;
  }

  addInput(input: Input) {
    this._inputs.push(input);
  }

  addOutput(output: Output) {
    this._outputs.push(output);
  }

  setLockTime(lockTime: number) {
    this._lockTime = lockTime;
  }

  static fromHex(raw: string) : Transaction {

    // Initialize data view
    const bytes = new Deserializer(raw);

    // Get tx version and create new Transaction instance
    const version = bytes.getUint32();
    const transaction = new Transaction();

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

      const output = new Output(value, pubKeyScript);
      transaction.addOutput(output);
    }

    // Locktime
    transaction.setLockTime(bytes.getUint32());
      
    return new Transaction();
  }

  toHex(): string {
    // return Buffer.from(this._bytes.buffer).toString('hex').toUpperCase();
    return 'XXXX';
  }
}