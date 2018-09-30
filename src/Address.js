// @flow
import crypto from 'crypto';

import PublicKey from './PublicKey';
import base58 from './base58';
import Network from './Network';


export default class Address {
  _bytes: Uint8Array  // Currently includes checksum?

  constructor(bytes: Uint8Array) {
    this._bytes = bytes;
  }

  get bytes() {
    return this._bytes;
  }

  toString(): string {
    return base58.encode(this._bytes);
  }

  toPublicKeyHash(): Uint8Array {
    // Return bytes minus 1 byte version (start) and 4 byte checksum (end)
    return this._bytes.slice(1, this._bytes.length - 4);
  }

  static fromString(address: string) {
    return new Address(base58.decode(address));
  }

  static fromPublicKeyHash(publicKeyHash: Uint8Array, network: Network): Address {
    const versionAndHash160 = new Uint8Array(1 + publicKeyHash.length);
    versionAndHash160.set([network.prefixes.publicKeyAddress]);
    versionAndHash160.set(publicKeyHash, 1);
    const firstSha = crypto
      .createHash('sha256')
      // $flow-disable-line cipher.update accepts Uint8Array contrary to flow error
      .update(versionAndHash160)
      .digest();
    const secondSha = crypto.createHash('sha256').update(firstSha).digest();
    const addressChecksum = secondSha.slice(0, 4);

    const bytes = new Uint8Array(versionAndHash160.length + addressChecksum.length);
    bytes.set(versionAndHash160);
    bytes.set(addressChecksum, versionAndHash160.length);

    return new Address(bytes);
  }

  static fromPublicKey(publicKey: PublicKey, network: Network): Address {
    const pubkey256 = crypto
      .createHash('sha256')
      // $flow-disable-line cipher.update accepts Uint8Array contrary to flow error
      .update(publicKey.bytes)
      .digest();
    const hash160 = crypto.createHash('RIPEMD160').update(pubkey256).digest();
    return Address.fromPublicKeyHash(hash160, network);
  }
}