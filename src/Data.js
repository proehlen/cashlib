/**
 * Base/wrapper class for objects that primarily consist or derive from data in bytes
 */
// @flow
import * as stringfu from 'stringfu';

export default class Data {
  _bytes: Uint8Array

  constructor(bytes: Uint8Array) {
    this._bytes = bytes;
  }

  get bytes(): Uint8Array {
    return this._bytes;
  }

  toHex(): string {
    return stringfu.fromBytes(this._bytes);
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