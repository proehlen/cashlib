// @flow
import crypto from 'crypto';
import { fromBytes, splitWidth } from 'stringfu';
import * as stringfu from 'stringfu';

import Data from './Data';
import base58 from './base58';
import base64 from './base64';
import Network from './Network';
import PublicKey from './PublicKey';
import { generatePublicKey } from './PrivateKey/secp256k1';

const BYTES_LENGTH: number = 32;

export default class PrivateKey extends Data {
  _compressed: boolean
  _wif: string;

  constructor(bytes: Uint8Array, compressed: boolean = false) {
    super(bytes);
    this._compressed = compressed;
  }

  get compressed() {
    return this._compressed;
  }

  static fromHex(hex: string) {
    const bytes = stringfu.toBytes(hex);
    return new this(bytes);
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

  toWif(network: Network): string {
    if (!this._wif) {
      const privKeyAndVersion = new Uint8Array(this.bytes.length + 1);
      privKeyAndVersion[0] = network.prefixes.privateKeyWif;
      privKeyAndVersion.set(this.bytes, 1);
      const firstSHA = crypto.createHash('sha256').update(Buffer.from(privKeyAndVersion)).digest();
      const secondSHA = crypto.createHash('sha256').update(firstSHA).digest();
      const checksum = secondSHA.slice(0, 4);
      const keyWithChecksum = Buffer.concat([Buffer.from(privKeyAndVersion), checksum]);
      this._wif = base58.encode(keyWithChecksum);
    }

    return this._wif;
  }

  /**
   * Returns private key encoded in ASN.1/DER format
   */
  toDer(): Uint8Array {
    const keyLen = this.bytes.length;
    const asn1PreString = [
      0x30, // declares the start of an ASN.1 sequence
      0x2e, // length of following sequence 
      0x02, // declares the start of an integer
      0x01, // length of integer in bytes (1 byte)
      0x01, // value of integer (1)
      0x04, // declares the start of an "octet string"
      keyLen, // length of string to follow (should be 32/0x20 bytes)
    ];

    const asn1Seckp256k1 = [0xa0, 0x07, 0x06, 0x05, 0x2b, 0x81, 0x04, 0x00, 0x0a];

    const asn1 = new Uint8Array(asn1PreString.length + keyLen + asn1Seckp256k1.length);
    asn1.set(asn1PreString, 0);
    asn1.set(this.bytes, asn1PreString.length);
    asn1.set(asn1Seckp256k1, asn1PreString.length + keyLen);
    return asn1;
  }

  toPem() {
    const prefix = '-----BEGIN EC PRIVATE KEY-----\n';
    const suffix = '\n-----END EC PRIVATE KEY-----';
    const asn1 = this.toDer();
    const asn1encoded = base64.encode(asn1);
    const asn1Lines = splitWidth(asn1encoded, 64).join('\n');
    const pem = `${prefix}${asn1Lines}${suffix}`;
    return pem;
  }

  toPublicKey(): PublicKey {
    return generatePublicKey(this);
  }
}
