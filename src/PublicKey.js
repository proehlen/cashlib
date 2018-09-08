// @flow
import { createECDH } from 'crypto';
import PrivateKey from './PrivateKey';

export default class PublicKey {
  _bytes: Uint8Array;

  constructor(bytes: Uint8Array) {
    this._bytes = bytes;
  }

  static fromPrivateKey(privateKey: PrivateKey) {
    const secp256k1 = createECDH('secp256k1');
    secp256k1.setPrivateKey(privateKey.bytes);
    return new PublicKey(secp256k1.getPublicKey());
  }

  toHexString(): string {
    return Buffer.from(this._bytes.buffer).toString('hex').toUpperCase();
  }
}
