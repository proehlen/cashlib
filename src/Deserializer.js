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

  getBytes(length: number) {
    const bytesBuffer = this._dataView.buffer.slice(
      this._byteOffset,
      this._byteOffset + length
    );
    const bytes = new Uint8Array(bytesBuffer)
    bytes.reverse();
    this._byteOffset += length;
    return bytes;
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
          // TODO - use bignum library
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