/**
 * Secp256k1 curve related functions
 */
// @flow
import BigInt from 'big-integer';
import * as stringfu from 'stringfu';
import assert from 'assert';

import PrivateKey from '../PrivateKey';
import PublicKey from '../PublicKey';
import EcPoint from './EcPoint';

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

export function generatePublicKey(privateKey: PrivateKey, compressed?: boolean): PublicKey {
  // Convert bytes to BigInt and validate
  const privKeyNumber = BigInt.fromArray(Array.from(privateKey.bytes), 256, false);
  if (privKeyNumber.isZero() || privKeyNumber.greaterOrEquals(prime)) {
    throw new Error('Invalid private key');
  }

  // Get point on curve represented by private key
  const privKeyBits = privKeyNumber.toString(2).split('');
  let q = new EcPoint(basePoint.x, basePoint.y);
  for (let i = 1; i <  privKeyBits.length; i++) {
    q = ecDouble(q);
    if (privKeyBits[i] === '1') {
      q = ecAdd(q);
    }
  }

  // Return point as public key
  const compress = compressed !== undefined ?
    compressed :
    privateKey.compressPublicKey;
  return new PublicKey(q.toBytes(compress));
}
