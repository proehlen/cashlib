/**
 * Extended private or public key per BIP-0032
 * 
 * Extended keys are regular keys with an additional 256 bits of entropy (the
 * chain code).
 */
// @flow

import crypto from 'crypto';
import assert from 'assert';
import { toBytes } from 'stringfu';

import Data from '../Data';
import Network from '../Network';
import PrivateKey from '../PrivateKey';
import PublicKey from '../PublicKey';
import Serializer from '../Serializer';
import base58 from '../base58';

export default class ExtendedKey {
  _key: PrivateKey | PublicKey
  _chainCode: Uint8Array
  _depth: number
  _childNumber: number
  _parentFingerprint: Uint8Array

  constructor(
    key: PrivateKey | PublicKey,
    chainCode: Uint8Array,
    depth: number,
    childNumber: number,
    parentFingerprint: Uint8Array,
  ) {
    assert(depth < 256, 'Depth must be single byte value.');
    assert(childNumber <= 0xffffffff, 'Child number can only be four bytes long');
    this._key = key;
    this._chainCode = chainCode;
    this._depth = depth;
    this._childNumber = childNumber;
    this._parentFingerprint = parentFingerprint;
  }

  get key() { return this._key; };
  get chainCode() { return this._chainCode; };
  get depth() { return this._depth; }
  get childNumber() { return this._childNumber; }
  get parentFingerprint() { return this._parentFingerprint; }

  getPrivateKey(): PrivateKey {
    if (this._key instanceof PrivateKey) {
      return this._key;
    } else {
      throw new Error('Key for this extended key is not a private key');
    }
  }

  getPublicKey(): PublicKey {
    if (this._key instanceof PublicKey) {
      return this._key;
    } else {
      throw new Error('Key for this extended key is not a public key');
    }
  }

  toSerialized(network: Network): string {
    const networkPrefix = this.key instanceof PrivateKey
      ? network.prefixes.extendedKeyVersion.private
      : network.prefixes.extendedKeyVersion.public;

    // Serialize data to be encoded
    const toBeEncoded = new Serializer();
    toBeEncoded.addBytes(networkPrefix);
    toBeEncoded.addUint8(this.depth);
    toBeEncoded.addBytes(this._parentFingerprint);
    toBeEncoded.addUint32(this.childNumber);
    toBeEncoded.addBytes(this.chainCode);
    if (this._key instanceof PrivateKey) {
      // Padding/dummy prefix for private keys to make them 33 bytes
      toBeEncoded.addUint8(0);
    }
    toBeEncoded.addBytes(this._key.bytes);
    const bytesToBeEncoded = toBytes(toBeEncoded.hex);

    // Build check sum from double-hash of bytes to be encoded
    // $flow-disable-line Uint8Array *is* compatible with cipher.update
    const firstSHA = crypto.createHash('sha256').update(bytesToBeEncoded).digest();
    const secondSHA = crypto.createHash('sha256').update(firstSHA).digest();
    const checksum = secondSHA.slice(0, 4);

    // Encode data and checksum
    const dataWithChecksum = Buffer.concat([Buffer.from(bytesToBeEncoded), checksum]);
    return base58.encode(dataWithChecksum);
  }
}
