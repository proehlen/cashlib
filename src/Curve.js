// @flow
import BigInt from 'big-integer';
import Point from './Point';

/**
 * The parameters that, when taken together, define the elliptic curve
 */
type CurveDomainParameters = {
  field: BigInt, // aka 'p' - integer specifying the finite field
  basePoint: Point, // aka 'G = (xG, yG)'
  order: BigInt, // aka 'n' - a prime which is the order of basePoint/G
  elementA: BigInt, // aka 'a' - one of two elements specifying the curve
  elementB: BigInt, // aka 'b' - one of two elements specifying the curve
  cofactor: BigInt, // aka 'h' - the cofactor
}

/**
 * Class representing an elliptic curve.
 */
export default class Curve {
  _field: BigInt
  _basePoint: Point
  _order: BigInt
  _elementA: BigInt
  _elementB: BigInt
  _cofactor: BigInt

  constructor(domainParameters: CurveDomainParameters) {
    this._field = domainParameters.field;
    this._basePoint = domainParameters.basePoint;
    this._order = domainParameters.order;
    this._elementA = domainParameters.elementA;
    this._elementB = domainParameters.elementB;
    this._cofactor = domainParameters.cofactor;
  }

  get field() { return this._field; }
  get basePoint() { return this._basePoint; }
  get order() { return this._order; }
  get elementA() { return this._elementA; }
  get elementB() { return this._elementB; }
  get cofactor() { return this._cofactor; }
}
