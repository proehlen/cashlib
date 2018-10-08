/**
 * Secp256k1 curve related functions
 */
// @flow
import BigInt from 'big-integer';

import PrivateKey from '../PrivateKey';
import PublicKey from '../PublicKey';
import CurvePoint from './CurvePoint';

// secp256k1 constants.  Unlike for other curves, we only need 3 here.  They are:
//   field.  aka 'p' - integer specifying the finite field
//   basePoint. aka 'G = (xG, yG)'
//   prime. aka 'n' - a prime which is the order of basePoint/G
export const field = BigInt('FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFC2F', 16);
export const basePoint = new CurvePoint(
  BigInt('79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798', 16),
  BigInt('483ADA7726A3C4655DA4FBFC0E1108A8FD17B448A68554199C47D08FFB10D4B8', 16),
);
export const prime = BigInt('FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141', 16);

export function generatePublicKey(privateKey: PrivateKey, compressed?: boolean): PublicKey {
  // Use elliptic curve point multiplication to derive point on curve (public key)
  // for the given private key
  const privKeyNumber = privateKey.toBigInt();
  let q = new CurvePoint(basePoint.x, basePoint.y);
  q.multiply(privKeyNumber);

  // Return point as PublicKey
  const compress = compressed !== undefined ?
    compressed :
    privateKey.compressPublicKey;
  return new PublicKey(q.toBytes(compress));
}
