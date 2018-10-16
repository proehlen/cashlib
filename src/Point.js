// @flow
import BigInt from 'big-integer';
import assert from 'assert';

/**
 * A simple point
 *
 * For an eliptic curve point see {@link CurvePoint}.
 */
export default class Point {
  _x: BigInt
  _y: BigInt

  constructor(x: BigInt, y: BigInt) {
    assert(!x.isZero() && !y.isZero());
    this._x = x;
    this._y = y;
  }

  /**
   * The point's x value
   */
  get x(): BigInt { return this._x; }

  /**
   * The point's y value
   */
  get y(): BigInt { return this._y; }
}
