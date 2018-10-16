// @flow
import * as stringfu from 'stringfu';
import crypto from 'crypto';
import BigInt from 'big-integer';

/**
 * Base/wrapper class for objects that primarily consist or derive from data in bytes
 */
export default class Data {
  _bytes: Uint8Array

  constructor(bytes: Uint8Array | Buffer | BigInt) {
    if (bytes instanceof Uint8Array) {
      this._bytes = bytes;
    } else if (bytes instanceof Buffer) {
      this._bytes = new Uint8Array(bytes);
    } else if (bytes instanceof BigInt) {
      this._bytes = new Uint8Array(bytes.toArray(256).value);
    } else {
      throw new Error('Invalid bytes argument');
    }
  }

  /**
   * Return data as a array of unsigned integers betwen 0 and 255 (ie 8 bit bytes)
   */
  toBytes(): Uint8Array {
    return this._bytes;
  }

  /**
   * Return data as a hex string
   */
  toHex(): string {
    return stringfu.fromBytes(this._bytes);
  }

  /**
   * Return data as a regular array
   */
  toArray(): Array<number> {
    return Array.from(this._bytes);
  }

  /**
   * Return data as a big integer
   */
  toBigInt(): BigInt {
    return BigInt.fromArray(this.toArray(), 256, false);
  }

  /**
   * Return data hashed with SHA-256 and then hashed again with RIPEMD-160.
   */
  toHash160(): Uint8Array {
    const sha256ed = crypto
      .createHash('sha256')
      // $flow-disable-line cipher.update accepts Uint8Array contrary to flow error
      .update(this._bytes)
      .digest();
    const hash160 = crypto.createHash('RIPEMD160').update(sha256ed).digest();
    return new Uint8Array(hash160);
  }

  /**
   * Create instance of {@link Data} from a hex string
   *
   * Note: The author doesn't know how to make 'this' polymorphic in flow-type;
   * Override (replicate) this method in child classes to avoid type warnings.
   */
  static fromHex(hex: string): Data {
    const bytes = stringfu.toBytes(hex);
    return new this(bytes);
  }
}
