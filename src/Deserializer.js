/**
 * Raw Bitcoin protocol data deserializer
 */

// @flow
import { Int64, UInt64 } from 'int64_t';
import { leftZeroPad } from './string';

export default class Deserializer {
  _dataView: DataView
  _byteOffset: number

  constructor (data: Uint8Array | string) {
    let bytes: Uint8Array;
    if (data instanceof Uint8Array) {
      bytes = data;
    } else if (typeof data === 'string') {
      bytes = new Uint8Array(data.length / 2);
      for (let sourcePos = 0, targetIndex = 0; sourcePos < data.length; sourcePos += 2, ++targetIndex) {
        const byteString = data.substr(sourcePos, 2);
        const byte = parseInt(byteString, 16);
        bytes[targetIndex] = byte;
      }
    } else {
      throw new Error('Invalid data for constructing Deserializer');
    }
    this._dataView = new DataView(bytes.buffer);
    this._byteOffset = 0;
  }

  getUint8() {
    const result = this._dataView.getUint8(this._byteOffset);
    ++this._byteOffset;
    return result;
  }

  getUint16() {
    const result = this._dataView.getUint16(this._byteOffset, true);
    this._byteOffset += 2;
    return result;
  }

  getUint32() {
    const result = this._dataView.getUint32(this._byteOffset, true);
    this._byteOffset += 4;
    return result;
  }

  /**
   * Get signed integer of 64 bits
   */
  getInt64(): number {
    const high = this.getUint32();
    const low = this.getUint32();
    const bigint = new Int64(low, high);
    const int = parseInt(bigint.toString());
    if (!Number.isSafeInteger(int)) {
      throw new Error('Value is outside of safe range');
    }
    return int;
  }

  /**
   * Get unsigned signed integer of 64 bits
   */
  getUInt64(): number {
    const high = this.getUint32();
    const low = this.getUint32();
    const bigint = new UInt64(low, high);
    const int = parseInt(bigint.toString());
    if (!Number.isSafeInteger(int)) {
      throw new Error('Value is outside of safe range');
    }
    return int;
  }

  /**
   * Get raw bytes
   * 
   * Endianess / order is not handled.  Use public methods for
   * numbers / data.
   * @param {number} length 
   */
  _getBytes(length: number) {
    const bytesBuffer = this._dataView.buffer.slice(
      this._byteOffset,
      this._byteOffset + length
    );
    const bytes = new Uint8Array(bytesBuffer)
    this._byteOffset += length;
    return bytes;
  }

  /**
   * Get bytes in corrected order
   * Gets raw bytes and reverses them
   * @param {number} length 
   */
  getData(length: number) {
    const bytes = this._getBytes(length);
    bytes.reverse();
    return bytes;
  }

  /**
   * Get contents at nominated offset without advancing/changing position
   * @param {number} offset 
   */
  _peek(offset: number): number {
    return this._dataView.getUint8(offset);
  }

  _highestBit(byte: number) {
    return byte >>> 7;
  }

  /**
   * Get value in satoshis via C int64_t type in buffer and return as number
   * 
   * Note: Despite the use of a 64 bit (signed) integer in the protocol,
   * JavaScript's number format easily handles amounts an order
   * of magnitude larger than the total number of satoshis
   * that will ever be mined so we can safely disable safety checking
   */
  getSatoshis(): number {
    return this.getInt64();
  }
  
  _bytesToString(bytes: Uint8Array): string {
    return Array.from(bytes).map(byte => this._byteToString(byte)).join('');
  }

  _byteToString(byte: number): string {
    let hex = byte.toString(16);
    return leftZeroPad(hex);
  }

  /**
   * Get compactSize unsigned int from current offset
   *
   * See https://bitcoin.org/en/developer-reference#compactsize-unsigned-integers
   */
  getCompactSize(): number {
    let value = 0;
    let bytesUsed = 0;

    value = this.getUint8();
    switch (value) {
      case 0xfd:
        value = this.getUint16();
        break;
      case 0xfe:
        value = this.getUint32();
        break;
      case 0xff:
        // No JavaScript unsigned int 64 so do it manually
        value = this.getUInt64();
        break;
      default:
        // value <= 0xfc means single byte already read is value
        break;
    }

    return value;
  }
}