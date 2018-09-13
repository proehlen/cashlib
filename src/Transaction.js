// @flow

import Deserializer from './Deserializer';
import Serializer from './Serializer';
import Input from './Input';
import Output from './Output';

const VERSION = 0x00000001;
const SEQUENCE = 0xfffffffe;

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

    const bytes = new Deserializer(raw);
    const transaction = new Transaction();

    // Get tx version
    const version = bytes.getUint32();
    if (version !== VERSION) {
      throw new Error(`Unrecognized transaction version (${version.toString(16)})`);
    }

    // Get transaction inputs
    const txInCount = bytes.getCompactSize();
    for (let inputIndex = 0; inputIndex < txInCount; ++inputIndex) {
      const transactionId = bytes.getData(32);
      const outputIndex = bytes.getUint32();
      const scriptBytesLength = bytes.getCompactSize();
      const signatureScript = bytes.getData(scriptBytesLength);
      const sequence = bytes.getUint32();
      if (sequence !== SEQUENCE)  {
        throw new Error(`Unexpected sequence value ${sequence.toString(16)}`);
      }

      const input = new Input(transactionId, outputIndex, signatureScript);
      transaction.addInput(input);
    }
      
    // Get transaction outputs
    const txOutCount = bytes.getCompactSize();
    for (let outputIndex = 0; outputIndex < txOutCount; ++outputIndex) {
      const value = bytes.getInt64();
      const pubkeyScriptBytesLen = bytes.getCompactSize();
      const pubKeyScript = bytes.getData(pubkeyScriptBytesLen);

      const output = new Output(value, pubKeyScript);
      transaction.addOutput(output);
    }

    // Locktime
    transaction.setLockTime(bytes.getUint32());
      
    return transaction;
  }

  toHex(): string {
    const bytes = new Serializer();
    bytes.addUint32(VERSION);

    // Add transaction inputs
    bytes.addCompactSize(this._inputs.length);
    for (let x = 0; x < this._inputs.length; ++x) {
      const input = this._inputs[x];
      bytes.addData(input.transactionId);
      bytes.addUint32(input.outputIndex);
      bytes.addCompactSize(input.signatureScript.length);
      bytes.addData(input.signatureScript);
      bytes.addUint32(SEQUENCE);
    }
      
    // Add transaction outputs
    bytes.addCompactSize(this._outputs.length);
    for (let x = 0; x < this._outputs.length; ++x) {
      const output = this._outputs[x];
      bytes.addInt64(output.value);
      bytes.addCompactSize(output.pubKeyScript.length);
      bytes.addData(output.pubKeyScript);
    }

    // Locktime
    bytes.addUint32(this._lockTime);
      
    return bytes.hex;
  }
}