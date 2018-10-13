// @flow
/* eslint-disable import/prefer-default-export */

import BigInt from 'big-integer';

const two = new BigInt(2);


/**
 * Computes a modular square root.
 *
 * Adapted from "Computing modular square roots in Python" by Eli Bendersky
 * https://eli.thegreenplace.net/2009/03/07/computing-modular-square-roots-in-python
 */
export function modSqrt(a: BigInt, p: BigInt): BigInt {
  let result: BigInt;

  // Computes the Legendre symbol a|p using Euler's criterion.
  function legendreSymbol(la: BigInt, lp: BigInt) {
    const ls = la.modPow(lp.subtract(1).divide(2), lp);
    return ls.equals(lp.subtract(1))
      ? BigInt.minusOne
      : ls;
  }


  // Handle simple cases first
  if (legendreSymbol(a, p).notEquals(BigInt.one)) {
    result = BigInt.zero;
  } else if (a.equals(BigInt.zero)) {
    result = BigInt.zero;
  } else if (p.equals(2)) {
    result = BigInt.zero;
  } else if (p.mod(4).equals(3)) {
    result = a.modPow(p.add(1).divide(4), p);
  } else {
    // Partition p-1 to s * 2^e for an odd
    let s = p.subtract(1);
    let e = BigInt.zero;
    while (s.mod(2).equals(0)) {
      s = s.divide(2);
      e = e.add(1);
    }

    // Find some 'n' with a legendre symbol n|p = -1
    let n = new BigInt(2);
    while (legendreSymbol(n, p).notEquals(BigInt.minusOne)) {
      n = n.add(1);
    }

    // Find result by adjusting guess that gets closer with each
    // iteration
    let x = a.modPow(s.add(1).divide(2), p);
    let b = a.modPow(s, p);
    let g = n.modPow(s, p);
    let r = new BigInt(e);

    for (;;) {
      let t = new BigInt(b);
      let m = BigInt.zero;
      for (m; m.lesser(r); m = m.add(1)) {
        if (t.equals(1)) break;
        t = t.modPow(2, p);
      }

      if (m.equals(0)) {
        result = x;
        break;
      }

      const gs = g.modPow(two.pow((r.subtract(m).subtract(1))), p);
      g = gs.pow(2).mod(p);
      x = x.multiply(gs).mod(p);
      b = b.multiply(g).mod(p);
      r = m;
    }
  }

  return result;
}
