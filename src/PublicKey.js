// @flow
import { createECDH, privateEncrypt } from 'crypto';
import PrivateKey from './PrivateKey';
import { stringToBytes } from './string';

export default class PublicKey {
  _bytes: Uint8Array;
  _compressed: boolean

  constructor(bytes: Uint8Array, compressed: boolean = false) {
    this._bytes = bytes;
    this._compressed = compressed;
  }

  get bytes(): Uint8Array {
    return this._bytes;
  }

  get compressed() {
    return this._compressed;
  }

  static fromPrivateKey(privateKey: PrivateKey) {
    const secp256k1 = createECDH('secp256k1');
    secp256k1.setPrivateKey(privateKey.bytes);
    let publicKey: PublicKey;
    if (privateKey.compressed) {
      const bytesString = secp256k1.getPublicKey('hex', 'compressed');
      const bytes = stringToBytes(bytesString);
      publicKey = new PublicKey(bytes);
    } else {
      publicKey = new PublicKey(secp256k1.getPublicKey());
    }
    return publicKey;
  }

  static fromString(publicKey: string): PublicKey {
    const bytes = stringToBytes(publicKey);
    return new PublicKey(bytes);
  }

  get hex(): string {
    return Buffer.from(this._bytes.buffer).toString('hex').toUpperCase();
  }
}
