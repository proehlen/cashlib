/**
 * Raw Bitcoin protocol data serializer
 */

// @flow
import { leftPad, reverseBytes, toBytes } from './string';

export default class Serializer {
  _hex: string

  constructor () {
    this._hex = '';
  }

  get hex() {
    return this._hex;
  }

  _addUint(value: number, sizeBytes: number) {
    let hex = value.toString(16);
    hex = leftPad(hex, sizeBytes * 2);
    hex = reverseBytes(hex);
    this._hex += hex;
  }

  addUint8(value: number) {
    this._addUint(value, 1);
  }

  addUint16(value: number) {
    this._addUint(value, 2);
  }

  addUint32(value: number) {
    this._addUint(value, 4);
  }

  /**
   * Add signed integer of 64 bits
   */
  addInt64(value: number) {
    // Operating value is value with 1 subtracted to support two's complement conversion.
    // Much easier to do it now than later when we are working in bytes
    let operatingValue = value < 0 ?
      Math.abs(value) - 1 :
      Math.abs(value)

    // Get operating value as bytes
    let hexString = Math.abs(operatingValue).toString(16);
    hexString = leftPad(hexString, 16);
    const bytes = Array.from(toBytes(hexString)).reverse();

    // Add bytes to output
    bytes.forEach((byte) => {
      // Handle negatives
      if (value < 0) {
        // Flip bits
        byte = 0xff - byte;
      }

      this._hex += leftPad(byte.toString(16),2);
    }); 
  }

  /**
   * Add bytes in corrected order
   * @param {number} length 
   */
  addData(data: Uint8Array) {
    const converted = Array
      .from(data)
      .reverse()
      .map(byte => leftPad(byte.toString(16), 2))
      .join('');
    this._hex += converted;
    // const bytes = this._getBytes(length);
    // bytes.reverse();
    // return bytes;
  }

  /**
   * Add compactSize unsigned int from current offset
   */
  addCompactSize(value: number) {
    if (value < 0) {
      throw new Error('compactSize can only store unsigned integers');
    } else if (value <= 252) {
      this.addUint8(value);
    } else if (value <= 0xffff) {
      this.addUint8(0xfd);
      this.addUint16(value);
    } else if (value <= 0xffffffff) {
      this.addUint8(0xfe);
      this.addUint32(value);
    } else {
      this.addUint8(0xff);
      // Add 64-bit unsigned int.  Use method for signed int because up to 
      // (ridiculously high) max value, int/uint is same for positive integers
      this.addInt64(value);  
    }
  }
}