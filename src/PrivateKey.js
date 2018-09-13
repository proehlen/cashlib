// @flow
import crypto from 'crypto';
import base58 from './base58';

const BYTES_LENGTH: number = 32;
const WIF_VERSION = 0x80;

export default class PrivateKey {
  _bytes: Uint8Array;
  _wif: string;

  constructor(bytes: Uint8Array) {
    this._bytes = bytes;
  }

  get bytes() {
    return this._bytes;
  }

  static fromHex(hex: string) {
    const argType = 'string';
    const argLength = (BYTES_LENGTH * 2);
    if (typeof hex !== argType || hex.length !== argLength) {
      throw new Error(`Invalid argument. Expected type '${argType}' with length '${argLength}'`);
    }

    let bytes = new Uint8Array(BYTES_LENGTH);
    for (let sourcePos = 0, targetIndex = 0; sourcePos < hex.length; sourcePos += 2, ++targetIndex) {
      const byteString = hex.substr(sourcePos, 2);
      const byte = parseInt(byteString, 16);
      bytes[targetIndex] = byte;
    }
      
    const privKey = new PrivateKey(bytes);
    return privKey;
  }

  get hex(): string {
    return Buffer.from(this._bytes.buffer).toString('hex').toUpperCase();
  }

  toWif(): string {
    if (!this._wif) {
      const privKeyAndVersion = new Uint8Array(BYTES_LENGTH + 1);
      privKeyAndVersion[0] = WIF_VERSION;
      privKeyAndVersion.set(this._bytes, 1);
      const firstSHA = crypto.createHash('sha256').update(Buffer.from(privKeyAndVersion)).digest();
      const secondSHA = crypto.createHash('sha256').update(firstSHA).digest();
      const checksum = secondSHA.slice(0, 4);
      const keyWithChecksum = Buffer.concat([Buffer.from(privKeyAndVersion), checksum]);
      this._wif = base58.encode(keyWithChecksum);
    }

    return this._wif;
  }

}