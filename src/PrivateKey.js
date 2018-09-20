// @flow
import crypto from 'crypto';
import base58 from './base58';
import type { Network } from './networks';

const BYTES_LENGTH: number = 32;

export default class PrivateKey {
  _bytes: Uint8Array;
  _compressed: boolean
  _wif: string;

  constructor(bytes: Uint8Array, compressed: boolean = false) {
    this._bytes = bytes;
    this._compressed = compressed;
  }

  get bytes() {
    return this._bytes;
  }

  get compressed() {
    return this._compressed;
  }

  static fromWif(wifKey: string): PrivateKey {
    const firstChar = wifKey.substr(0, 1);
    let compressed: boolean;
    switch (firstChar) {
      case '5':
        // Mainnet
        compressed = false;
        break;
      case 'K':
      case 'L':
        // Mainnet
        compressed = true;
        break;
      case '9':
        // Testnet
        compressed = false;
        break;
      case 'c':
        // Testnet
        compressed = true;
        break;
      default:
        // Don't know how to handle this (refer 'WIF to private key' @
        // https://en.bitcoin.it/wiki/Wallet_import_format ).
        throw new Error('Unrecognized WIF private key');
    }
    const wifBytes = new Uint8Array(base58.decode(wifKey));
    const dropLast4 = wifBytes.slice(0, wifBytes.length - 4);
    const dropFirst = dropLast4.slice(1);
    let keyBytes;
    if (compressed) {
      keyBytes = dropFirst.slice(0, dropFirst.length - 1);
    } else {
      keyBytes = dropFirst;
    }
    return new PrivateKey(keyBytes, compressed);
  }

  static fromHex(hex: string) {
    const argType = 'string';
    const argLength = (BYTES_LENGTH * 2);
    if (typeof hex !== argType || hex.length !== argLength) {
      throw new Error(`Invalid argument. Expected type '${argType}' with length '${argLength}'`);
    }

    let bytes = new Uint8Array(BYTES_LENGTH);
    for (let sourcePos = 0, targetIndex = 0; sourcePos < hex.length; sourcePos += 2, ++targetIndex) {
      const byteString = hex.substr(sourcePos, 2);
      const byte = parseInt(byteString, 16);
      bytes[targetIndex] = byte;
    }
      
    const privKey = new PrivateKey(bytes);
    return privKey;
  }

  get hex(): string {
    return Buffer.from(this._bytes.buffer).toString('hex').toUpperCase();
  }

  toWif(network: Network): string {
    if (!this._wif) {
      const privKeyAndVersion = new Uint8Array(BYTES_LENGTH + 1);
      privKeyAndVersion[0] = network.prefixes.privateKeyWif;
      privKeyAndVersion.set(this._bytes, 1);
      const firstSHA = crypto.createHash('sha256').update(Buffer.from(privKeyAndVersion)).digest();
      const secondSHA = crypto.createHash('sha256').update(firstSHA).digest();
      const checksum = secondSHA.slice(0, 4);
      const keyWithChecksum = Buffer.concat([Buffer.from(privKeyAndVersion), checksum]);
      this._wif = base58.encode(keyWithChecksum);
    }

    return this._wif;
  }

}