// @flow
import { toBytes } from 'stringfu';
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
    return privateKey.toPublicKey();
  }
}
