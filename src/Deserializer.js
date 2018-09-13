/**
 * Raw Bitcoin protocol data deserializer
 */

// @flow
import { leftPad, toBytes } from './string';

export default class Deserializer {
  _dataView: DataView
  _byteOffset: number

  constructor (data: Uint8Array | string) {
    let bytes;
    if (data instanceof Uint8Array) {
      bytes = data;
    } else if (typeof data === 'string') {
      bytes = toBytes(data);
    }
    if (!bytes || !bytes.length) {
      throw new Error('Invalid argument for constructing Deserializer');
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
    const data =this.getData(8);
    let sign = 1;
    if (data[0] >>> 7 === 1)  {
      // High bit set, number is signed (two's complement)
      sign = -1;
      // Flip bits
      data.forEach((byte, index) => {
        const inverted = (~ byte) % 256;
        data[index] = inverted;
      }); 
    }

    const numberString =  Array.from(data)
      .map(byte => leftPad(byte.toString(16), 2))
      .join('');

    let number = parseInt(numberString, 16);

    if (sign < 0) {
      number *= sign;
      number -= 1;
    }

    if (!Number.isSafeInteger(number)) {
      throw new Error('Integer is outside of safe range');
    }

    return number;
  }

  /**
   * Get unsigned signed integer of 64 bits
   */
  getUInt64(): number {
    const data = Array.from(this.getData(8));
    const numberString = data
      .map(byte => leftPad(byte.toString(16), 2))
      .join('');
    let number = parseInt(numberString, 16);
    if (!Number.isSafeInteger(number)) {
      throw new Error('Integer is outside of safe range');
    }

    return number;
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

  _bytesToString(bytes: Uint8Array): string {
    return Array.from(bytes).map(byte => this._byteToString(byte)).join('');
  }

  _byteToString(byte: number): string {
    let hex = byte.toString(16);
    return leftPad(hex);
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