// @flow

type CompactSize = {
  value: number,
  bytesUsed: number   
}

type Outpoint = {
  hash: Uint8Array,
  index: number
}

export default class Transaction {
  _version: number

  constructor (version: number = 1) {
    this._version = version;
  }

  static fromHexString(raw: string) : Transaction {

    let bytes = new Uint8Array(raw.length / 2);
    for (let sourcePos = 0, targetIndex = 0; sourcePos < raw.length; sourcePos += 2, ++targetIndex) {
      const byteString = raw.substr(sourcePos, 2);
      const byte = parseInt(byteString, 16);
      bytes[targetIndex] = byte;
    }

    // Initialize data view
    const dataView = new DataView(bytes.buffer);
    let byteOffset = 0;


    // Get tx version and create new Transaction instance
    const version = dataView.getUint32(byteOffset, true);
    byteOffset += 4;
    const transaction = new Transaction(version);

    // Get transaction inputs
    let compactSize = this._getCompactSize(dataView, byteOffset);
    byteOffset += compactSize.bytesUsed;
    const txInCount = compactSize.value;
    for (let txIndex = 0; txIndex < txInCount; ++txIndex) {
      const previousOutput = this._getOutpoint(dataView, byteOffset);
      debugger;

    }


      
    return new Transaction();
  }

  toHexString(): string {
    // return Buffer.from(this._bytes.buffer).toString('hex').toUpperCase();
    return 'XXXX';
  }

  static _getOutpoint(dataView: DataView, byteOffset: number) : Outpoint {
    const hashLength = 32;
    debugger;
    const hashBuffer = dataView.buffer.slice(byteOffset, byteOffset + hashLength);
    const hash = (new Uint8Array(hashBuffer)).reverse();
    const index = dataView.getUint32(byteOffset + hashLength);
    return {
      hash,
      index
    }
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
      case 0xfd:
        bytesUsed = 3;
        value = dataView.getUint16(byteOffset + 1, true);
        break;
      case 0xfe:
        bytesUsed = 5;
        value = dataView.getUint32(byteOffset + 1, true);
        break;
      case 0xff:
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
      default:
        // value <= 0xfc:
        bytesUsed = 1;
        break;
    }

    return {
      value,
      bytesUsed,
    };
  }
}