// @flow
import crypto from 'crypto';

import PublicKey from './PublicKey';
import base58 from './base58';
import { stringFromBytes } from './string';

export default class Address {
  _unencoded: Uint8Array

  constructor(unencoded: Uint8Array) {
    this._unencoded = unencoded;
  }

  toString(): string {
    return base58.encode(this._unencoded);
  }

  static fromPublicKey(publicKey: PublicKey): Address {
    const pubkey256 = crypto.createHash('sha256').update(Buffer.from(publicKey.bytes)).digest();
    const hash160 = crypto.createHash('RIPEMD160').update(pubkey256).digest();

    // TODO handle different networks
    const version = 0x00; // BTC? testnet
    // const version = 0x6f; // BTC? testnet

    const hashAndBytes = new Uint8Array(1 + hash160.length);
    hashAndBytes.set([version]);
    hashAndBytes.set(hash160, 1);
    const firstSha = crypto.createHash('sha256').update(hashAndBytes).digest();
    const secondSha = crypto.createHash('sha256').update(firstSha).digest();
    const addressChecksum = secondSha.slice(0, 4);

    const unencoded = new Uint8Array(1 + hash160.length + addressChecksum.length);
    unencoded.set([0x00]);
    unencoded.set(hash160, 1);
    unencoded.set(addressChecksum, 1 + hash160.length);

    return new Address(unencoded);
  }
}