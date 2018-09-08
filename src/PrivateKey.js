// @flow
import crypto from 'crypto';
import base58 from './base58';

const KEY_LENGTH: number = 32;
const WIF_VERSION = 0x80;

export default class PrivateKey {
  _key: Uint8Array;
  _wif: string;

  constructor(key: Uint8Array) {
    this._key = key;
  }

  static fromHexString(hexString: string) {
    const argType = 'string';
    const argLength = (KEY_LENGTH * 2);
    if (typeof hexString !== argType || hexString.length !== argLength) {
      throw new Error(`Invalid argument. Expected type '${argType}' with length '${argLength}'`);
    }

    let key = new Uint8Array(KEY_LENGTH);
    for (let sourcePos = 0, targetIndex = 0; sourcePos < hexString.length; sourcePos += 2, ++targetIndex) {
      const byteString = hexString.substr(sourcePos, 2);
      const byte = parseInt(byteString, 16);
      key[targetIndex] = byte;
    }
      
    const privKey = new PrivateKey(key);
    return privKey;
  }

  toHexString(): string {
    return Buffer.from(this._key.buffer).toString('hex').toUpperCase();
  }

  toWif(): string {
    if (!this._wif) {
      const privKeyAndVersion = new Uint8Array(KEY_LENGTH + 1);
      privKeyAndVersion[0] = WIF_VERSION;
      privKeyAndVersion.set(this._key, 1);
      const firstSHA = crypto.createHash('sha256').update(Buffer.from(privKeyAndVersion)).digest();
      const secondSHA = crypto.createHash('sha256').update(firstSHA).digest();
      const checksum = secondSHA.slice(0, 4);
      const keyWithChecksum = Buffer.concat([Buffer.from(privKeyAndVersion), checksum]);
      this._wif = base58.encode(keyWithChecksum);
    }

    return this._wif;
  }

}