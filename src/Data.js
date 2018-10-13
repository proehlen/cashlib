/**
 * Base/wrapper class for objects that primarily consist or derive from data in bytes
 */
// @flow
import * as stringfu from 'stringfu';
import assert from 'assert';
import crypto from 'crypto';
import BigInt from 'big-integer';

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

  toBytes(): Uint8Array {
    return this._bytes;
  }

  toHex(): string {
    return stringfu.fromBytes(this._bytes);
  }

  toArray(): Array<number> {
    return Array.from(this._bytes);
  }

  toBigInt(): BigInt {
    return BigInt.fromArray(this.toArray(), 256, false);
  }

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
   * Note: Don't know how to make 'this' polymorphic in flow;
   * Override (replicate) in child classes to avoid type warnings.
   */
  static fromHex(hex: string) {
    const bytes = stringfu.toBytes(hex);
    return new this(bytes);
  }
}