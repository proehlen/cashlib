/**
 * Class representing an Elliptic Curve.
 * 
 * Note: since we presently only use secp256k1, there are two constants (a, h)
 * that aren't needed and not included in this class.
 */
// @flow
import BigInt from 'big-integer';

type BasePoint = {
  x: BigInt,
  y: BigInt,
}

export default class Curve {
  _field: BigInt // aka 'p' - integer specifying the finite field
  _basePoint: BasePoint // aka 'G = (xG, yG)'
  _prime: BigInt // aka 'n' - a prime which is the order of basePoint/G

  constructor(field: BigInt, basePoint: BasePoint, prime: BigInt) {
    this._field = field;
    this._basePoint = basePoint;
    this._prime = prime;
  }

  get field() { return this._field; }
  get basePoint() { return this._basePoint; }
  get prime() { return this._prime; }
}
