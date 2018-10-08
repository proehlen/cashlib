/**
 * Base/wrapper class for objects that primarily consist or derive from data in bytes
 */
// @flow
import * as stringfu from 'stringfu';
import assert from 'assert';
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

  get bytes(): Uint8Array {
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

  /**
   * Note: Don't know how to make 'this' polymorphic in flow;
   * Override (replicate) in child classes to avoid type warnings.
   */
  static fromHex(hex: string) {
    const bytes = stringfu.toBytes(hex);
    return new this(bytes);
  }
}