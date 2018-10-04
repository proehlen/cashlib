// @flow

import crypto from 'crypto';
import { fromBytes, toBytes } from 'stringfu';

import Deserializer from './Deserializer';
import Serializer from './Serializer';
import Input from './Input';
import Output from './Output';
import PrivateKey from './PrivateKey';
import PublicKey from './PublicKey';

const VERSION = 0x00000001;
const SIGHASH_ALL = new Uint8Array([0x01, 0x00, 0x00, 0x00]);

export type PreviousOutput = {
  transactionId: string,
  outputIndex: number,
  output: Output,
}

export default class Transaction {
  _inputs: Input[]
  _outputs: Output[]
  _lockTime: number;

  constructor () {
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

  static deserialize(raw: string) : Transaction {
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
    bytes.addUint32(VERSION);

    // Add transaction inputs
    bytes.addCompactSize(this._inputs.length);
    for (let x = 0; x < this._inputs.length; ++x) {
      const input = this._inputs[x];
      bytes.addBytesString(input.transactionId, true);
      bytes.addUint32(input.outputIndex);
      bytes.addCompactSize(input.signatureScript.length);
      bytes.addBytes(input.signatureScript);
      bytes.addUint32(input.sequence);
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
    bytes.addUint32(this._lockTime);
      
    return bytes.hex;
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

  signP2PKH(previousOutputs: PreviousOutput[], privateKey: PrivateKey) {
    const publickey = PublicKey.fromPrivateKey(privateKey);

    // Start with copy of this transaction (TODO - performance improvements)
    const toSign = Transaction.deserialize(this.serialize());

    // For each P2PKH previous output we are signing, set the input signatureScript temporarily to the
    // publicKeyScript of the output it references
    let inputCount = 0;
    for (let input of toSign.inputs) {
      // TODO remove when we know how to handle these
      inputCount++;
      if (inputCount > 1) {
        throw new Error('Transaction has multiple inputs. Don\'t know how to sign');
      }

      // TODO remove when we know how to handle this
      if (input.signatureScript.length > 0) {
        throw new Error('Transaction input already signed. Don\'t know how to handle this');
      }

      // Find the previous output this input references
      const previousOutput = previousOutputs.find(output =>
        output.transactionId === input.transactionId
        && output.outputIndex === input.outputIndex);
      if (!previousOutput) {
        throw new Error(`Missing previous output (txid: '${input.transactionId}, number ${input.outputIndex})`);
      } else if (previousOutput.output.scriptType !== 'P2PKH') {
        throw new Error(`Previous output is not P2PKH - don\'t know how to sign (txid: '${input.transactionId}, number ${input.outputIndex})`);
      }

      // Replace sigScript with P2PKH
      input._signatureScript = previousOutput.output.pubKeyScript;
    }

    // Get bytes of our modified transaction and add four byte hash code type
    const bytesToSign = toBytes(toSign.serialize());
    const bytesAndSigHash = new Uint8Array(bytesToSign.length + 4);
    bytesAndSigHash.set(bytesToSign, 0);
    bytesAndSigHash.set(SIGHASH_ALL, bytesToSign.length);

    // Double-SHA256 bytes to be signed
    // $flow-disable-line  Uint8Array *is* compatible with crypto/update
    const hashedOnce = crypto.createHash('sha256').update(bytesAndSigHash).digest();
    const doubleHashed = crypto.createHash('sha256').update(hashedOnce).digest();

    // Sign transaction with private key
    const signer = crypto.createSign('SHA256');
    signer.write(doubleHashed);
    signer.end();
    const signed = signer.sign(privateKey.toPem());

    // Build script sig
    const scriptSig = new Uint8Array(1 + signed.length + 1 + 1 + publickey.bytes.length );
    let offset = 0;
    scriptSig.set([signed.length + 1], offset); // Length of signed + 1 byte SIGHASH type
    offset++;
    scriptSig.set(signed, offset); // Signed data
    offset += signed.length;
    scriptSig.set([SIGHASH_ALL[1]], offset) // One byte SIGHASH type
    offset++;
    scriptSig.set([publickey.bytes.length], offset) // Length of public key
    offset++
    scriptSig.set(publickey.bytes, offset) // Public key

    // Update script sig in original transaction
    // TODO - handle multiple inputs
    this.inputs[0]._signatureScript = scriptSig;
  }
}
