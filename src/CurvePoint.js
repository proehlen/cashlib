// @flow
import BigInt from 'big-integer';
import * as stringfu from 'stringfu';
import assert from 'assert';

import Point from './Point';
import secp256k1 from './secp256k1';
import { modSqrt } from './math';

/**
 * Point on Eliptic Curve
 *
 * Note: methods add, double and multiply relate to elliptic curve point
 * multiplication and not regular math operations.
 *
 * Note: since we presently only use secp256k1, some simplifications are possible
 * in elliptic curve point multiplication.  If other curves are implemented,
 * these may not apply and this class may need to be updated.
 */
export default class CurvePoint extends Point {

  /**
   * Return a new point from adding one point to another.
   *
   * The term 'Add' in this context refers to elliptic curve arithmetic and
   * not regular addition.
   */
  static add(pointA: Point, pointB: Point): CurvePoint {
    const lamda = pointB.y
      .subtract(pointA.y)
      .multiply(
        pointB.x
          .subtract(pointA.x)
          .modInv(secp256k1.field),
      )
      .mod(secp256k1.field);
    const x = lamda
      .pow(2)
      .subtract(pointA.x)
      .subtract(pointB.x)
      .mod(secp256k1.field);
    let y = lamda
      .multiply(pointA.x.subtract(x))
      .subtract(pointA.y)
      .mod(secp256k1.field);
    if (y.isNegative()) {
      y = y.add(secp256k1.field);
    }

    // Return new point
    return new CurvePoint(x, y);
  }

  /**
   * Return a new point by doubling the provided point.
   *
   * See {@link https://en.wikipedia.org/wiki/Elliptic_curve_point_multiplication#Point_doubling Point doubling}
   */
  static double(point: Point): CurvePoint {
    const lamda = point.x
      .pow(2)
      .multiply(3)
      .multiply(
        point.y
          .multiply(2)
          .modInv(secp256k1.field),
      )
      .mod(secp256k1.field);
    const x = lamda
      .pow(2)
      .subtract(point.x.multiply(2))
      .mod(secp256k1.field);
    let y = lamda
      .multiply(point.x.subtract(x))
      .subtract(point.y)
      .mod(secp256k1.field);

    if (y.isNegative()) {
      y = y.add(secp256k1.field);
    }

    // Update x/y
    return new CurvePoint(x, y);
  }

  static multiply(value: BigInt): CurvePoint {
    if (value.isZero() || value.greaterOrEquals(secp256k1.order)) {
      throw new Error('Invalid value/key for ec point multiplication');
    }

    let point = new CurvePoint(secp256k1.basePoint.x, secp256k1.basePoint.y);
    const bits = value.toString(2).split('');
    for (let i = 1; i < bits.length; i++) {
      point = CurvePoint.double(point);
      if (bits[i] === '1') {
        point = CurvePoint.add(point, secp256k1.basePoint);
      }
    }

    return point;
  }

  toBytes(compressed: boolean = true) {
    const length = compressed ? 33 : 65;
    const bytes = new Uint8Array(length);
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
   * Use elliptic curve point multiplication to derive the point (public key) on
   * secp256k1 curve for the given integer (private key)
   */
  static fromBigInt(value: BigInt): CurvePoint {
    assert(value instanceof BigInt, 'Value is not a big integer');
    return CurvePoint.multiply(value);
  }

  static fromHex(hex: string) {
    const bytes = stringfu.toBytes(hex);
    return CurvePoint.fromBytes(bytes);
  }

  static fromBytes(bytes: Uint8Array): CurvePoint {
    let x: BigInt;
    let y: BigInt;
    if (bytes.length === 65 && bytes[0] === 0x04) {
      // Uncompressed public key
      x = BigInt.fromArray(Array.from(bytes.slice(1, 33)), 256, false);
      y = BigInt.fromArray(Array.from(bytes.slice(33, 65)), 256, false);
    } else if (bytes.length === 33) {
      // Compressed public key
      x = BigInt.fromArray(Array.from(bytes.slice(1)), 256, false);
      let requireEven: boolean;
      if (bytes[0] === 0x02) {
        // Should produce point with even Y value
        requireEven = true;
      } else if (bytes[0] === 0x03) {
        // Should produce point with odd Y value
        requireEven = false;
      }

      // Calculate y
      const ySquared = x.pow(3).add(secp256k1.elementB).mod(secp256k1.field);
      y = modSqrt(ySquared, secp256k1.field);
      if (y.isEven() !== requireEven) {
        // Get other square root
        y = secp256k1.field.subtract(y);
      }
    }

    if (x === undefined || y === undefined) {
      throw new Error('Unable to reconstruct curve point from unrecognized byte format');
    } else {
      return new CurvePoint(x, y);
    }
  }
}
