// @flow
import { leftPad, toBytes, fromBytes } from 'stringfu';

/**
 * Class for deserializing data
 *
 * This class is instantiated with data as 8-bit wide bytes in some (undefined here)
 * serializiation format.  It reads that data in various sized chunks
 * in response to different method calls and keeps track of which bytes
 * have already been consumed for the next request.
 */
export default class Deserializer {
  _dataView: DataView
  _byteOffset: number

  constructor(data: Uint8Array | string) {
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

  /**
   * Returns the next 1 byte from the serialized data as an unsigned 8 bit integer
   */
  getUint8(): number {
    const result = this._dataView.getUint8(this._byteOffset);
    ++this._byteOffset;
    return result;
  }

  /**
   * Returns the next 2 bytes from the serialized data as an unsigned 16 bit integer
   *
   * TODO provide option for endianness
   */
  getUint16(): number {
    const result = this._dataView.getUint16(this._byteOffset, true);
    this._byteOffset += 2;
    return result;
  }

  /**
   * Returns the next 4 bytes from the serialized data as an unsigned 32 bit integer
   *
   * TODO provide option for endianness
   */
  getUint32(): number {
    const result = this._dataView.getUint32(this._byteOffset, true);
    this._byteOffset += 4;
    return result;
  }

  /**
   * Returns the next 8 bytes from the serialized data as a signed 64 bit integer
   *
   * TODO provide option for endianness
   */
  getInt64(): number {
    const data = this.getBytes(8).reverse();
    let sign = 1;
    if (data[0] >>> 7 === 1) {
      // High bit set, number is signed (two's complement)
      sign = -1;
      // Flip bits
      data.forEach((byte, index) => {
        const inverted = (~byte) % 256;
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
   * Returns the next 8 bytes from the serialized data as an unsigned 64 bit integer
   *
   * TODO provide option for endianness
   */
  getUInt64(): number {
    const data = Array.from(this.getBytes(8).reverse());
    const numberString = data
      .map(byte => leftPad(byte.toString(16), 2, '0'))
      .join('');
    const number = parseInt(numberString, 16);
    if (!Number.isSafeInteger(number)) {
      throw new Error('Integer is outside of safe range');
    }

    return number;
  }

  /**
   * Return `length` number of raw bytes unprocessed from the serialized data
   */
  getBytes(length: number): Uint8Array {
    const bytesBuffer = this._dataView.buffer.slice(
      this._byteOffset,
      this._byteOffset + length,
    );
    const bytes = new Uint8Array(bytesBuffer);
    this._byteOffset += length;
    return bytes;
  }

  /**
   * Return `length` number of raw bytes as a hex string from the serialized data
   *
   * Note: returned string is twice the length of the requested bytes `length`
   */
  getBytesString(length: number, reverse: boolean = false): string {
    let bytes = this.getBytes(length);
    if (reverse) {
      bytes = bytes.reverse();
    }
    return fromBytes(bytes);
  }

  /**
   * Get contents at nominated offset without advancing/changing position
   * @private
   */
  _peek(offset: number): number {
    return this._dataView.getUint8(offset);
  }

  /**
   * Return highest bit of 8-bit byte
   * @private
   */
  _highestBit(byte: number): number {
    return byte >>> 7;
  }

  /**
   * Return compactSize unsigned integer from serialized data
   *
   * See {@link https://bitcoin.org/en/developer-reference#compactsize-unsigned-integers Compactsize unsigned integers}
   */
  getCompactSize(): number {
    let value = 0;

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
