// @flow

type CompactSize = {
  value: number,
  bytesUsed: number   
}

export default class Transaction {

  static fromHexString(raw: string) : Transaction {
    let bytes = new Uint8ClampedArray(raw.length / 2);
    for (let sourcePos = 0, targetIndex = 0; sourcePos < raw.length; sourcePos += 2, ++targetIndex) {
      const byteString = raw.substr(sourcePos, 2);
      const byte = parseInt(byteString, 16);
      bytes[targetIndex] = byte;
    }

    debugger;
    const view = new DataView(bytes.buffer);
    let byteOffset = 0;
    const version = view.getUint32(byteOffset, true);
    byteOffset += 4;
    console.log(version.toString(16))
    debugger;

    const size = view.getUint32(byteOffset);
    byteOffset += 4;
    console.log(size.toString(16))


      
    return new Transaction();
  }

  toHexString(): string {
    // return Buffer.from(this._bytes.buffer).toString('hex').toUpperCase();
    return 'XXXX';
  }

  /**
   * Get compactSize unsigned int from nominated offset in a DataView
   *
   * For numbers from 0 to 252, compactSize unsigned integers look like regular unsigned integers.
   * For other numbers up to 0xffffffffffffffff, a byte is prefixed to the number to indicate its
   * length—but otherwise the numbers look like regular unsigned integers in little-endian order.
   * Source: https://bitcoin.org/en/developer-reference#compactsize-unsigned-integers
   *
   * @param {*} dataView 
   * @param {*} byteOffset 
   */
  static _getCompactSize(dataView: DataView, byteOffset: number) : CompactSize {
    let value = 0;
    let bytesUsed = 0;

    value = dataView.getUint8(byteOffset);
    switch (value) {
      case (value <= 0xfc):
        bytesUsed = 1;
        break;
      case (value == 0xfd):
        bytesUsed = 3;
        value = dataView.getUint16(byteOffset + 1, true);
        break;
      case (value == 0xfe):
        bytesUsed = 5;
        value = dataView.getUint32(byteOffset + 1, true);
        break;
      case (value == 0xff):
        bytesUsed = 9;
        // No JavaScript unsigned int 64 so do it manually
        const low = dataView.getUint32(byteOffset + 1, true);
        const high = dataView.getUint32(byteOffset + 5, true);
        value = (high * 0x100000000) + low;
        if (value > Number.MAX_SAFE_INTEGER) {
          // TODO - use bignum library
          throw new Error('compactSize value > MAX_SAFE_INTEGER');
        }
        break;
    }

    return {
      value,
      bytesUsed,
    };
  }
}