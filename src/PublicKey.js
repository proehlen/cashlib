// @flow
import * as stringfu from 'stringfu';

import CurvePoint from './CurvePoint';
import Data from './Data';
import PrivateKey from './PrivateKey';

/**
 * A Bitcoin public key
 */
export default class PublicKey extends Data {
  /**
   * Indicator: this public key is compressed
   */
  get compressed(): boolean {
    return this.toBytes().length === 33;
  }

  /**
   * Return public key instance from bytes in hex string format
   */
  static fromHex(hex: string) {
    const bytes = stringfu.toBytes(hex);
    return new this(bytes);
  }

  /**
   * Derive public key from an instance of a private key
   *
   * *Warning:* This operation is slow/expensive; cache results where possible.
   */
  static fromPrivateKey(privateKey: PrivateKey, compressed?: boolean) {
    return privateKey.toPublicKey(compressed);
  }

  /**
   * Return the point on the secp256k1 curve associated with this public key
   */
  toCurvePoint(): CurvePoint {
    return CurvePoint.fromBytes(this.toBytes());
  }
}
