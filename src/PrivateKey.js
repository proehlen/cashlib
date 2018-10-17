// @flow
import BigInt from 'big-integer';
import assert from 'assert';
import crypto from 'crypto';
import * as stringfu from 'stringfu';

import CurvePoint from './CurvePoint';
import Data from './Data';
import base58 from './base58';
import base64 from './base64';
import Network from './Network';
import PublicKey from './PublicKey';

const BYTES_LENGTH: number = 32;

/**
 * A private key
 */
export default class PrivateKey extends Data {
  _compressPublicKey: boolean
  _wif: string;

  constructor(bytes: Uint8Array, compressPublicKey: boolean = false) {
    assert(bytes.length === BYTES_LENGTH);
    super(bytes);
    this._compressPublicKey = compressPublicKey;
  }

  get compressPublicKey() {
    return this._compressPublicKey;
  }

  static fromHex(hex: string) {
    const bytes = stringfu.toBytes(hex);
    return new this(bytes);
  }

  static fromWif(wifKey: string): PrivateKey {
    const firstChar = wifKey.substr(0, 1);
    let compressPublicKey: boolean;
    switch (firstChar) {
      case '5':
        // Mainnet
        compressPublicKey = false;
        break;
      case 'K':
      case 'L':
        // Mainnet
        compressPublicKey = true;
        break;
      case '9':
        // Testnet
        compressPublicKey = false;
        break;
      case 'c':
        // Testnet
        compressPublicKey = true;
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
    if (compressPublicKey) {
      keyBytes = dropFirst.slice(0, dropFirst.length - 1);
    } else {
      keyBytes = dropFirst;
    }
    return new PrivateKey(keyBytes, compressPublicKey);
  }

  static fromBigInt(value: BigInt) {
    assert(value instanceof BigInt, 'Value is not a big integer');

    // Get integer as bytes
    const bytes = new Uint8Array(BYTES_LENGTH);
    const maybeShortBytes = value.toArray(256).value;
    const offset = BYTES_LENGTH - maybeShortBytes.length;
    bytes.set(maybeShortBytes, offset);

    return new PrivateKey(bytes);
  }

  toWif(network: Network): string {
    if (!this._wif) {
      const privKeyAndVersion = new Uint8Array(this.toBytes().length + 1);
      privKeyAndVersion[0] = network.prefixes.privateKeyWif;
      privKeyAndVersion.set(this.toBytes(), 1);
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
    const keyLen = this.toBytes().length;
    const asn1PreString = [
      0x30, // declares the start of an ASN.1 sequence
      0x2e, // length of following sequence
      0x02, // declares the start of an integer
      0x01, // length of integer in bytes (1 byte)
      0x01, // value of integer (1)
      0x04, // declares the start of an "octet string"
      keyLen, // length of string to follow (should be 32/0x20 bytes)
    ];

    const asn1Secp256k1 = [0xa0, 0x07, 0x06, 0x05, 0x2b, 0x81, 0x04, 0x00, 0x0a];

    const asn1 = new Uint8Array(asn1PreString.length + keyLen + asn1Secp256k1.length);
    asn1.set(asn1PreString, 0);
    asn1.set(this.toBytes(), asn1PreString.length);
    asn1.set(asn1Secp256k1, asn1PreString.length + keyLen);
    return asn1;
  }

  toPem() {
    const prefix = '-----BEGIN EC PRIVATE KEY-----\n';
    const suffix = '\n-----END EC PRIVATE KEY-----';
    const asn1 = this.toDer();
    const asn1encoded = base64.encode(asn1);
    const asn1Lines = stringfu.splitWidth(asn1encoded, 64).join('\n');
    const pem = `${prefix}${asn1Lines}${suffix}`;
    return pem;
  }

  toPublicKey(compressed?: boolean): PublicKey {
    const point = this.toCurvePoint();

    // Return point as PublicKey
    const compress = compressed !== undefined
      ? compressed
      : this.compressPublicKey;
    return new PublicKey(point.toBytes(compress));
  }

  /**
   * Derive point (public key) on secp256k1 curve for the integer
   * (private key)
   */
  toCurvePoint(): CurvePoint {
    return CurvePoint.fromBigInt(this.toBigInt());
  }
}
