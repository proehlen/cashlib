// @flow
import { leftPad, reverseBytes, toBytes } from 'stringfu';

export type Endianness = 'LE' | 'BE';

/**
 * Class for serializing data
 */
export default class Serializer {
  _hex: string

  constructor() {
    this._hex = '';
  }

  toHex() {
    return this._hex;
  }

  toBytes(): Uint8Array {
    return toBytes(this._hex);
  }

  _addUint(value: number, sizeBytes: number, endianness: Endianness): Serializer {
    let hex = value.toString(16);
    hex = leftPad(hex, sizeBytes * 2, '0');
    if (endianness === 'LE') {
      hex = reverseBytes(hex);
    }
    this._hex += hex;

    // Return this to support chaining
    return this;
  }

  addUint8(value: number): Serializer {
    // Endianness doesn't matter for one byte value but is required by _addUint so
    // just pass anything
    this._addUint(value, 1, 'LE');

    // Return this to support chaining
    return this;
  }

  addUint16(value: number, endianness: Endianness): Serializer {
    this._addUint(value, 2, endianness);

    // Return this to support chaining
    return this;
  }

  addUint32(value: number, endianness: Endianness): Serializer {
    this._addUint(value, 4, endianness);

    // Return this to support chaining
    return this;
  }

  /**
   * Add signed integer of 64 bits
   */
  addInt64(value: number): Serializer {
    // Operating value is value with 1 subtracted to support two's complement conversion.
    // Much easier to do it now than later when we are working in bytes
    const operatingValue = value < 0
      ? Math.abs(value) - 1
      : Math.abs(value);

    // Get operating value as bytes
    let hexString = Math.abs(operatingValue).toString(16);
    hexString = leftPad(hexString, 16, '0');
    const bytes = Array.from(toBytes(hexString)).reverse();

    // Add bytes to output
    bytes.forEach((byte) => {
      // Handle negatives by flipping bits
      const handled = (value < 0)
        ? 0xff - byte
        : byte;

      this._hex += leftPad(handled.toString(16), 2, '0');
    });

    // Return this to support chaining
    return this;
  }

  /**
   * Add bytes
   * @param {number} length
   */
  addBytes(data: Uint8Array): Serializer {
    const converted = Array
      .from(data)
      .map(byte => leftPad(byte.toString(16), 2, '0'))
      .join('');
    this._hex += converted;

    // Return this to support chaining
    return this;
  }

  addBytesString(bytes: string, reverse: boolean = false): Serializer {
    if (!reverse) {
      this._hex += bytes;
    } else {
      this._hex += reverseBytes(bytes);
    }

    // Return this to support chaining
    return this;
  }


  /**
   * Add compactSize unsigned int from current offset
   */
  addCompactSize(value: number): Serializer {
    if (value < 0) {
      throw new Error('compactSize can only store unsigned integers');
    } else if (value <= 252) {
      this.addUint8(value);
    } else if (value <= 0xffff) {
      this.addUint8(0xfd);
      this.addUint16(value, 'LE');
    } else if (value <= 0xffffffff) {
      this.addUint8(0xfe);
      this.addUint32(value, 'LE');
    } else {
      this.addUint8(0xff);
      // Add 64-bit unsigned int.  Use method for signed int because up to
      // (ridiculously high) max value, int/uint is same for positive integers
      this.addInt64(value);
    }

    // Return this to support chaining
    return this;
  }
}
