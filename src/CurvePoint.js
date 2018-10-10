/**
 * Point on Eliptic Curve
 * 
 * Note: methods add, double and multiply relate to elliptic curve point
 * multiplication and not regular math operations.
 */
// @flow
import BigInt from 'big-integer';
import * as stringfu from 'stringfu';

import Curve from './Curve';
import { modSqrt } from './math';

export default class CurvePoint {
  _curve: Curve
  _x: BigInt
  _y: BigInt

  constructor(curve: Curve, x: BigInt, y: BigInt) {
    this._curve = curve;
    this._x = x;
    this._y = y;
  }

  get curve() { return this._curve; }
  get x() { return this._x; }
  get y() { return this._y; }

  add() {
    const lamda = this.curve.basePoint.y
      .subtract(this.y)
      .multiply(
        this.curve.basePoint.x
          .subtract(this.x)
          .modInv(this.curve.field)
      )
      .mod(this.curve.field);
    const x = lamda
      .pow(2)
      .subtract(this.x)
      .subtract(this.curve.basePoint.x)
      .mod(this.curve.field);
    let y = lamda
      .multiply(this.x.subtract(x))
      .subtract(this.y)
      .mod(this.curve.field);
    if (y.isNegative()) {
      y = y.add(this.curve.field);
    }

    // Update x/y
    this._x = x;
    this._y = y;
  }

  double() {
    const lamda = this.x
      .pow(2)
      .multiply(3)
      .multiply(
        this.y
          .multiply(2)
          .modInv(this.curve.field)
      )
      .mod(this.curve.field);
    const x = lamda
      .pow(2)
      .subtract(this.x.multiply(2))
      .mod(this.curve.field);
    let y = lamda
      .multiply(this.x.subtract(x))
      .subtract(this.y)
      .mod(this.curve.field);
    
    if (y.isNegative()) {
      y = y.add(this.curve.field);
    }
    
    // Update x/y
    this._x = x;
    this._y = y;
  }

  multiply(value: BigInt) {
    if (value.isZero() || value.greaterOrEquals(this.curve.prime)) {
      throw new Error('Invalid value/key for ec point multiplication');
    }

    const bits = value.toString(2).split('');
    for (let i = 1; i <  bits.length; i++) {
      this.double();
      if (bits[i] === '1') {
        this.add();
      }
    }
  }

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

  toHex(compressed: boolean = true): string {
    const bytes = this.toBytes(compressed);
    return stringfu.fromBytes(bytes);
  }

  /**
   * Use elliptic curve point multiplication to derive point (public key) on
   * secp256k1 curve for the given integer (private key)
   */
  static fromInteger(curve: Curve, value: BigInt): CurvePoint {
    const point = new CurvePoint(curve, curve.basePoint.x, curve.basePoint.y);
    point.multiply(value);
    return point;
  }

  static fromHex(curve: Curve, hex: string) {
    const bytes = stringfu.toBytes(hex);
    return CurvePoint.fromBytes(curve, bytes);
  }
  
  static fromBytes(curve: Curve, bytes: Uint8Array): CurvePoint {
    let x: BigInt;
    let y: BigInt;
    if (bytes.length === 65 && bytes[0] === 0x04) {
      // Uncompressed public key
      x = new BigInt.fromArray(Array.from(bytes.slice(1, 33)), 256, false);
      y = new BigInt.fromArray(Array.from(bytes.slice(33, 65)), 256, false);
    } else if (bytes.length === 33) {
      // Compressed public key
      x = new BigInt.fromArray(Array.from(bytes.slice(1)), 256, false);
      let requireEven: boolean;
      if (bytes[0] === 0x02) {
        // Should produce point with even Y value
        requireEven = true;
      } else if (bytes[0] === 0x03) {
        // Should produce point with odd Y value
        requireEven = false;
      }

      // Calculate y
      // const ySquared = x.pow(3).add(curve.elementB).mod(curve.field);
      const ySquared = x.pow(3).add(curve.elementB).mod(curve.field);
      y = modSqrt(ySquared, curve.field);
      if (y.isEven() !== requireEven) {
        // Get other square root
        y = curve.field.subtract(y);
      }
    }

    if (x === undefined || y === undefined) {
      throw new Error('Unable to reconstruct curve point from unrecognized byte format');
    } else {
      return new CurvePoint(curve, x, y);
    }
  }
}
