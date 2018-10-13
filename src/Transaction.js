// @flow

import crypto from 'crypto';
import { toBytes } from 'stringfu';

import Deserializer from './Deserializer';
import Serializer from './Serializer';
import Input from './Input';
import Output from './Output';

const VERSION = 0x00000001;

/**
 * A Bitcoin transaction
 */
export default class Transaction {
  _inputs: Input[]
  _outputs: Output[]
  _lockTime: number;

  constructor() {
    this._inputs = [];
    this._outputs = [];
    this._lockTime = 0;
  }

  get inputs() {
    return this._inputs;
  }

  get outputs() {
    return this._outputs;
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

  static deserialize(raw: string): Transaction {
    if (raw.length < 10) {
      throw new Error('Raw string provided is too short');
    }

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
      const transactionId = bytes.getBytesString(32, true);
      const outputIndex = bytes.getUint32();
      const scriptBytesLength = bytes.getCompactSize();
      const signatureScript = bytes.getBytes(scriptBytesLength);
      const sequence = bytes.getUint32();

      const input = new Input(transactionId, outputIndex, signatureScript, sequence);
      transaction.addInput(input);
    }

    // Get transaction outputs
    const txOutCount = bytes.getCompactSize();
    for (let outputIndex = 0; outputIndex < txOutCount; ++outputIndex) {
      const value = bytes.getInt64();
      const pubkeyScriptBytesLen = bytes.getCompactSize();
      const pubKeyScript = bytes.getBytes(pubkeyScriptBytesLen);

      const output = new Output(value, pubKeyScript);
      transaction.addOutput(output);
    }

    // Locktime
    transaction.setLockTime(bytes.getUint32());

    return transaction;
  }

  serialize(): string {
    const bytes = new Serializer();
    bytes.addUint32(VERSION, 'LE');

    // Add transaction inputs
    bytes.addCompactSize(this._inputs.length);
    for (let x = 0; x < this._inputs.length; ++x) {
      const input = this._inputs[x];
      bytes.addBytesString(input.transactionId, true);
      bytes.addUint32(input.outputIndex, 'LE');
      bytes.addCompactSize(input.signatureScript.length);
      bytes.addBytes(input.signatureScript);
      bytes.addUint32(input.sequence, 'LE');
    }

    // Add transaction outputs
    bytes.addCompactSize(this._outputs.length);
    for (let x = 0; x < this._outputs.length; ++x) {
      const output = this._outputs[x];
      bytes.addInt64(output.value);
      bytes.addCompactSize(output.pubKeyScript.length);
      bytes.addBytes(output.pubKeyScript);
    }

    // Locktime
    bytes.addUint32(this._lockTime, 'LE');

    return bytes.toHex();
  }

  getId(): string {
    const byteString = this.serialize();
    const bytes = toBytes(byteString);
    const firstSha = crypto
      .createHash('sha256')
      // $flow-disable-line cipher.update accepts Uint8Array contrary to flow error
      .update(bytes)
      .digest();
    const secondSha = crypto.createHash('sha256').update(firstSha).digest();
    return secondSha.reverse().toString('hex');
  }
}
