/**
 * Raw Bitcoin protocol data deserializer
 */

// @flow
import { leftPad, toBytes, fromBytes } from 'stringfu';

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
    const data =this.getBytes(8).reverse();
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

    const numberString = fromBytes(data);
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
    const data = Array.from(this.getBytes(8).reverse());
    const numberString = data
      .map(byte => leftPad(byte.toString(16), 2, '0'))
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
   * @param {number} length 
   */
  getBytes(length: number) {
    const bytesBuffer = this._dataView.buffer.slice(
      this._byteOffset,
      this._byteOffset + length
    );
    const bytes = new Uint8Array(bytesBuffer)
    this._byteOffset += length;
    return bytes;
  }

  getBytesString(length: number, reverse: boolean = false) {
    let bytes = this.getBytes(length);
    if (reverse) {
      bytes = bytes.reverse();
    }
    return fromBytes(bytes);
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