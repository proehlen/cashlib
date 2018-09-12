/**
 * Raw Bitcoin protocol data serializer
 */

// @flow
import { leftPad, reverseBytes } from './string';
// import { Int64, UInt64 } from 'int64_t';

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
  addInt64() {
    // const high = this.getUint32();
    // const low = this.getUint32();
    // const bigint = new Int64(low, high);
    // const int = parseInt(bigint.toString());
    // if (!Number.isSafeInteger(int)) {
    //   throw new Error('Value is outside of safe range');
    // }
    // return int;
  }

  /**
   * Add unsigned signed integer of 64 bits
   */
  addUint64(value: number) {
    // const high = this.getUint32();
    // const low = this.getUint32();
    // const bigint = new UInt64(low, high);
    // const int = parseInt(bigint.toString());
    // if (!Number.isSafeInteger(int)) {
    //   throw new Error('Value is outside of safe range');
    // }
    // return int;
  }

  /**
   * Add raw bytes
   * 
   * Endianess / order is not handled.  Use public methods for
   * numbers / data.
   * @param {number} length 
   */
  // _addBytes(length: number) {
    // const bytesBuffer = this._dataView.buffer.slice(
    //   this._byteOffset,
    //   this._byteOffset + length
    // );
    // const bytes = new Uint8Array(bytesBuffer)
    // this._byteOffset += length;
    // return bytes;
  // }

  /**
   * Add bytes in corrected order
   * @param {number} length 
   */
  addData(length: number, data: Uint8Array) {
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
   * Add value in satoshis
   */
  addSatoshis() {
    // return this.getInt64();
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
      this.addUint64(value);
    }
  }
}