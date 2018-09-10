// @flow
export default class Deserializer {
  _dataView: DataView
  _byteOffset: number

  constructor (bytes: Uint8Array) {
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

  // TODO remove if not needed
  getInt32() {
    const result = this._dataView.getInt32(this._byteOffset, true);
    this._byteOffset += 4;
    return result;
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

  /**
   * Get value in satoshis via C int64_t type in buffer and return as number
   * 
   * Note: Despite the use of a 64 bit (signed) integer in the protocol,
   * JavaScript's number format easily handles amounts an order
   * of magnitude larger than the total number of satoshis
   * that will ever be mined so no need to work with a bignum
   * library for these amounts. See Number.MIN_SAFE_INTEGER and
   * Number.MAX_SAFE_INTEGER for range.
   */
  getSatoshis(): number {
    let low = this.getUint32();
    let high = this.getInt32();
    if (high) {
      const lastByte = this._peek(this._byteOffset - 1);
      if ((lastByte >>> 7) === 0x1) {
        // TODO implement two's-complement for negative values when we
        // understand where they are used
        throw new Error('Negative satoshi values not yet implemented')
      }
    }
    return (high * 0x10000000) + low;;
  }
  
  _bytesToString(bytes: Uint8Array): string {
    return Array.from(bytes).map(byte => this._byteToString(byte)).join('');
  }

  _byteToString(byte: number): string {
    let hex = byte.toString(16);
    return this._leftZeroPad(hex);
  }

  _leftZeroPad(str: string, length: number = 2) {
    let result = str;
    const padLength = length - str.length;
    for (let i = 0; i < padLength; ++i) {
      result = `0${result}`;
    }
    return result;
  }

  /**
   * Get compactSize unsigned int from current offset
   *
   * For numbers from 0 to 252, compactSize unsigned integers look like regular unsigned integers.
   * For other numbers up to 0xffffffffffffffff, a byte is prefixed to the number to indicate its
   * length—but otherwise the numbers look like regular unsigned integers in little-endian order.
   * Source: https://bitcoin.org/en/developer-reference#compactsize-unsigned-integers
   *
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
        const low = this.getUint32();
        const high = this.getUint32();
        value = (high * 0x100000000) + low;
        if (value > Number.MAX_SAFE_INTEGER) {
          // TODO - possibly use bignum library but I first want to discover
          // which values might require it since MAX_SAFE_INTEGER is a huge 
          // number (an order of magnatitude greater than the all of the
          // satoshis that will ever be mined for example)
          throw new Error('compactSize value > MAX_SAFE_INTEGER');
        }
        break;
      default:
        // value <= 0xfc means single byte already read is value
        break;
    }

    return value;
  }
}