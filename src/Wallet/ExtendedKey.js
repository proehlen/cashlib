// @flow

import crypto from 'crypto';
import assert from 'assert';
import { toBytes } from 'stringfu';

import Network from '../Network';
import PrivateKey from '../PrivateKey';
import PublicKey from '../PublicKey';
import Serializer from '../Serializer';
import base58 from '../base58';

/**
 * Extended private or public key per BIP-0032
 *
 * Extended keys are regular keys with an additional 256 bits of entropy (the
 * chain code).
 */
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

  get key() { return this._key; }
  get chainCode() { return this._chainCode; }
  get depth() { return this._depth; }
  get childNumber() { return this._childNumber; }
  get parentFingerprint() { return this._parentFingerprint; }

  getPrivateKey(): PrivateKey {
    if (!(this._key instanceof PrivateKey)) {
      throw new Error('Key for this extended key is not a private key');
    }
    return this._key;
  }

  getPublicKey(): PublicKey {
    if (!(this._key instanceof PublicKey)) {
      throw new Error('Key for this extended key is not a public key');
    }
    return this._key;
  }

  /**
   * Return signature of extended key
   *
   * The signature is a hex string with enough data to uniquiely id the
   * extended key without collision. It is effectively the serialized
   * extended key (refer BIP-0032#Serialization_format) but devoid of
   * the network prefix and is not hashed
   */
  getSignature(): string {
    const signature = new Serializer();
    signature.addUint8(this.depth);
    signature.addBytes(this._parentFingerprint);
    // TODO understand why spec calls for following line but works with just raw bytes
    // "4 bytes: child number. This is ser32(i) for i in xi = xpar/i, with xi the
    // key being serialized. (0x00000000 if master key)"
    signature.addUint32(this.childNumber, 'BE');
    signature.addBytes(this.chainCode);
    if (this._key instanceof PrivateKey) {
      // Padding/dummy prefix for private keys to make them 33 bytes
      signature.addUint8(0);
    }
    signature.addBytes(this._key.toBytes());
    return signature.toHex();
  }

  toSerialized(network: Network): string {
    const networkPrefix = this.key instanceof PrivateKey
      ? network.prefixes.extendedKeyVersion.private
      : network.prefixes.extendedKeyVersion.public;

    // Serialize data to be encoded
    const toBeEncoded = new Serializer();
    toBeEncoded.addBytes(networkPrefix);
    toBeEncoded.addBytesString(this.getSignature());
    const bytesToBeEncoded = toBytes(toBeEncoded.toHex());

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
