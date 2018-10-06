// @flow
import { toBytes } from 'stringfu';
import { createECDH, privateEncrypt } from 'crypto';
import * as stringfu from 'stringfu';

import Data from './Data';
import PrivateKey from './PrivateKey';

export default class PublicKey extends Data {

  get compressed() {
    return this.bytes.length === 33;
  }

  static fromHex(hex: string) {
    const bytes = stringfu.toBytes(hex);
    return new this(bytes);
  }

  static fromPrivateKey(privateKey: PrivateKey) {
    const secp256k1 = createECDH('secp256k1');
    secp256k1.setPrivateKey(privateKey.bytes);
    let publicKey: PublicKey;
    if (privateKey.compressed) {
      const bytesString = secp256k1.getPublicKey('hex', 'compressed');
      const bytes = toBytes(bytesString);
      publicKey = new PublicKey(bytes);
    } else {
      publicKey = new PublicKey(secp256k1.getPublicKey());
    }
    return publicKey;
  }
}
