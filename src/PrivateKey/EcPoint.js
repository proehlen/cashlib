/**
 * Secp256k1 curve related functions
 */
// @flow
import BigInt from 'big-integer';
import * as stringfu from 'stringfu';

export default class EcPoint {
  _x: BigInt
  _y: BigInt

  constructor(x: BigInt, y: BigInt) {
    this._x = x;
    this._y = y;
  }

  get x() { return this._x; }
  get y() { return this._y; }

  toHex(compressed: boolean = true) {
    let prefix = '';
    const x = stringfu.leftPad(this.x.toString(16), 64, '0');
    let maybeY = '';
    if (!compressed) {
      prefix = '04'
      maybeY = stringfu.leftPad(this.y.toString(16), 64, '0');
    } else {
      if (this.y.isEven()) {
        prefix = '02'
      } else {
        prefix = '03'
      }
    }

    return `${prefix}${x}${maybeY}`;
  }
}
