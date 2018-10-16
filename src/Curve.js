// @flow
import BigInt from 'big-integer';
import Point from './Point';

/**
 * The parameters that, when taken together, define the elliptic curve
 */
type CurveDomainParameters = {
  field: BigInt,
  basePoint: Point,
  order: BigInt,
  elementA: BigInt,
  elementB: BigInt,
  cofactor: BigInt,
}

/**
 * Class representing an elliptic curve.
 * @package
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

  /**
   * The curve's field, aka 'p' - an integer specifying the finite field
   */
  get field(): BigInt { return this._field; }

  /**
   * The curve's base point, aka 'G = (xG, yG)'
   */
  get basePoint(): Point { return this._basePoint; }

  /**
   * The curve's order, aka 'n' - a prime which is the order of basePoint/G
   */
  get order(): BigInt { return this._order; }


  /**
   * The curve's first element value, aka 'a' - one of two elements specifying the curve
   */
  get elementA(): BigInt { return this._elementA; }

  /**
   * The curve's second element value, aka 'b' - one of two elements specifying the curve
   */
  get elementB(): BigInt { return this._elementB; }


  /**
   * The curve's cofactor, aka 'h'
   */
  get cofactor(): BigInt { return this._cofactor; }
}
