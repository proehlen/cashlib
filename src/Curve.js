/**
 * Class representing an Elliptic Curve.
 * 
 * Note: since we presently only use secp256k1, some simplifications are possible
 * in elliptic curve point multiplication.  If other curves are implemented,
 * these may not apply and class CurvePoint would have to be updated.
 */
// @flow
import BigInt from 'big-integer';

type CurveBasePoint = {
  x: BigInt,
  y: BigInt,
}

type CurveDomainParameters = {
  field: BigInt, // aka 'p' - integer specifying the finite field
  basePoint: CurveBasePoint, // aka 'G = (xG, yG)'
  prime: BigInt, // aka 'n' - a prime which is the order of basePoint/G
  elementA: BigInt, // aka 'a' - one of two elements specifying the curve
  elementB: BigInt, // aka 'b' - one of two elements specifying the curve
  cofactor: BigInt, // aka 'h' - the cofactor
}

export default class Curve {
  _field: BigInt
  _basePoint: CurveBasePoint
  _prime: BigInt
  _elementA: BigInt
  _elementB: BigInt
  _cofactor: BigInt

  constructor(domainParameters: CurveDomainParameters) {
    this._field = domainParameters.field;
    this._basePoint = domainParameters.basePoint;
    this._prime = domainParameters.prime;
    this._elementA = domainParameters.elementA;
    this._elementB = domainParameters.elementB;
    this._cofactor = domainParameters.cofactor;
  }

  get field() { return this._field; }
  get basePoint() { return this._basePoint; }
  get prime() { return this._prime; }
  get elementA() { return this._elementA; }
  get elementB() { return this._elementB; }
  get cofactor() { return this._cofactor; }
}
