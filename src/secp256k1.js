/**
 * Secp256k1 curve related functions
 */
// @flow
import BigInt from 'big-integer';
import * as stringfu from 'stringfu';

class EcPoint {
  _x: BigInt
  _y: BigInt

  constructor(x: BigInt, y: BigInt) {
    this._x = x;
    this._y = y;
  }

  get x() { return this._x; }
  get y() { return this._y; }

  toHex(compressionByte: boolean = true) {
    const x = stringfu.leftPad(this.x.toString(16), 64, '0');
    const y = stringfu.leftPad(this.y.toString(16), 64, '0');
    const prefix = compressionByte
      ? '04'
      : '';
    return `${prefix}${x}${y}`;
  }
}

// secp256k1 constants.  Unlike for other curves, we only need 3 here.  They are:
//   field.  aka 'p' - integer specifying the finite field
//   basePoint. aka 'G = (xG, yG)'
//   prime. aka 'n' - a prime which is the order of basePoint/G
const field = BigInt('FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFC2F', 16);
const basePoint = new EcPoint(
  BigInt('79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798', 16),
  BigInt('483ADA7726A3C4655DA4FBFC0E1108A8FD17B448A68554199C47D08FFB10D4B8', 16),
);
const prime = BigInt('FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141', 16);

function ecAdd(point: EcPoint) {
  const lamda = basePoint.y
    .subtract(point.y)
    .multiply(
      basePoint.x.subtract(point.x).modInv(field)
    )
    .mod(field);
  const x = lamda
    .pow(2)
    .subtract(point.x)
    .subtract(basePoint.x)
    .mod(field);
  let y = lamda
    .multiply(point.x.subtract(x))
    .subtract(point.y)
    .mod(field);
  if (y.isNegative()) {
    y = y.add(field);
  }
  return new EcPoint(x, y);
}

function ecDouble(point: EcPoint) {
  const lamda = point.x
    .pow(2)
    .multiply(3)
    .multiply(
      point.y.multiply(2).modInv(field)
    ).mod(field);
  const x = lamda
    .pow(2)
    .subtract(point.x.multiply(2))
    .mod(field);
  let y = lamda
    .multiply(point.x.subtract(x))
    .subtract(point.y)
    .mod(field);
  
  if (y.isNegative()) {
    y = y.add(field);
  }
  
  return new EcPoint(x, y);
}

export function generatePublicKeyBytes(privKeyBytes: Uint8Array): Uint8Array {
  // Convert bytes to BigInt (big-integer lib array functions are troublesome so
  // do via strings) & validate 
  const privKeyString = stringfu.leftPad(stringfu.fromBytes(privKeyBytes), 32, '0');
  const privKey = new BigInt(privKeyString, 16);
  if (privKey.isZero() || privKey.greaterOrEquals(prime)) {
    throw new Error('Invalid private key');
  }

  // Get point on curve represented by private key
  const privKeyBits = privKey.toString(2).split('');
  let q = new EcPoint(basePoint.x, basePoint.y);
  for (let i = 1; i <  privKeyBits.length; i++) {
    q = ecDouble(q);
    if (privKeyBits[i] === '1') {
      q = ecAdd(q);
    }
  }

  // Convert point to public key bytes (big-integer lib array functions are troublesome so
  // do via strings)
  const x = stringfu.toBytes(stringfu.leftPad(q.x.toString(16), 32, '0'));
  const y = stringfu.toBytes(stringfu.leftPad(q.y.toString(16), 32, '0'));
  const pubKeyBytes = new Uint8Array(65);
  pubKeyBytes.set([0x04], 0);
  pubKeyBytes.set(x, 1);
  pubKeyBytes.set(y, 33);
  return pubKeyBytes;
}
