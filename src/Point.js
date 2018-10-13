// @flow
import BigInt from 'big-integer';
import assert from 'assert';

/**
 * A simple point
 * @private
 */
export default class Point {
  _x: BigInt
  _y: BigInt

  constructor(x: BigInt, y: BigInt) {
    assert(!x.isZero() && !y.isZero());
    this._x = x;
    this._y = y;
  }

  get x() { return this._x; }
  get y() { return this._y; }
}
