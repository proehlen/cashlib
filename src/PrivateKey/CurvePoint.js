/**
 * Point on Eliptic Curve
 */
// @flow
import BigInt from 'big-integer';
import * as stringfu from 'stringfu';

export default class CurvePoint {
  _x: BigInt
  _y: BigInt

  constructor(x: BigInt, y: BigInt) {
    this._x = x;
    this._y = y;
  }

  get x() { return this._x; }
  get y() { return this._y; }

  toBytes(compressed: boolean = true) {
    const length = compressed ? 33 : 65;
    let bytes = new Uint8Array(length);
    if (!compressed) {
      // Uncompressed === 0x04<x><y>
      bytes.set([0x04], 0);
      bytes.set(this.x.toArray(256).value, 1);
      bytes.set(this.y.toArray(256).value, 33);
    } else {
      // Compressed === 0x02||0x03<x>
      if (this.y.isEven()) {
        bytes.set([0x02], 0);
      } else {
        bytes.set([0x03], 0);
      }
      bytes.set(this.x.toArray(256).value, 1);
    }
    return bytes;
  }

  toHex(compressed: boolean = true) {
    const bytes = this.toBytes(compressed);
    return stringfu.fromBytes(bytes);
  }
}
