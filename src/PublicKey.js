// @flow
import * as stringfu from 'stringfu';

import CurvePoint from './CurvePoint';
import Data from './Data';
import PrivateKey from './PrivateKey';

export default class PublicKey extends Data {
  get compressed() {
    return this.toBytes().length === 33;
  }

  static fromHex(hex: string) {
    const bytes = stringfu.toBytes(hex);
    return new this(bytes);
  }

  static fromPrivateKey(privateKey: PrivateKey, compressed?: boolean) {
    return privateKey.toPublicKey(compressed);
  }

  toCurvePoint(): CurvePoint {
    return CurvePoint.fromBytes(this.toBytes());
  }
}
