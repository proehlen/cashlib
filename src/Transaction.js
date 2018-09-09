// @flow

import Deserializer from './Deserializer';

export default class Transaction {
  _version: number

  constructor (version: number = 1) {
    this._version = version;
  }

  static fromHexString(raw: string) : Transaction {

    let bytes = new Uint8Array(raw.length / 2);
    for (let sourcePos = 0, targetIndex = 0; sourcePos < raw.length; sourcePos += 2, ++targetIndex) {
      const byteString = raw.substr(sourcePos, 2);
      const byte = parseInt(byteString, 16);
      bytes[targetIndex] = byte;
    }

    // Initialize data view
    const deserializer = new Deserializer(bytes);

    // Get tx version and create new Transaction instance
    const version = deserializer.getUint32();
    const transaction = new Transaction(version);

    // Get transaction inputs
    const txInCount = deserializer.getCompactSize();
    for (let inputIndex = 0; inputIndex < txInCount; ++inputIndex) {
      const utxoTxId = deserializer.getBytes(32);
      const utxoIndex = deserializer.getUint32();
      const scriptBytesLength = deserializer.getCompactSize();
      const signatureScript = deserializer.getBytes(scriptBytesLength);
      const sequence = deserializer.getUint32();
    }
      
    // Get transaction outputs
    const txOutCount = deserializer.getCompactSize();
    for (let outputIndex = 0; outputIndex < txInCount; ++outputIndex) {
    }
      
    return new Transaction();
  }

  toHexString(): string {
    // return Buffer.from(this._bytes.buffer).toString('hex').toUpperCase();
    return 'XXXX';
  }
}