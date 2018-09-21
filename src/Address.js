// @flow
import crypto from 'crypto';

import PublicKey from './PublicKey';
import base58 from './base58';
import { stringFromBytes } from './string';
import Network from './Network';


export default class Address {
  _unencoded: Uint8Array

  constructor(unencoded: Uint8Array) {
    this._unencoded = unencoded;
  }

  toString(): string {
    return base58.encode(this._unencoded);
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

    const unencoded = new Uint8Array(versionAndHash160.length + addressChecksum.length);
    unencoded.set(versionAndHash160);
    unencoded.set(addressChecksum, versionAndHash160.length);

    return new Address(unencoded);
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