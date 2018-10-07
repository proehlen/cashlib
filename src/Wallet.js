/**
 * Class for working with Hierarchical Deterministic (HD) Wallets per BIP-0032
 *
 * Note: this class does *not* implement BIP-0039 or BIP-0044.  See MnemonicSeed
 * and MultiAccount (coming soon) classes respectively for those functionalities.
 */
// @flow

import { createHmac } from 'crypto';
import assert from 'assert';

import PrivateKey from './PrivateKey';
import PublicKey from './PublicKey';
import ExtendedPrivateKey from './Wallet/ExtendedPrivateKey';
import ExtendedPublicKey from './Wallet/ExtendedPublicKey';
import Data from './Data';
import Serializer from './Serializer';
import { generatePublicKey } from './PrivateKey/secp256k1';

const twoPower31 = 2 ^ 31;

export default class Wallet {
  _seed: Data
  _extendedPrivateKey: ExtendedPrivateKey
  _extendedPublicKey: ExtendedPublicKey

  constructor(seed: Data) {
    this._seed = seed;

    // Generate master key
    const hmac = createHmac('sha512', 'Bitcoin seed');
    // $flow-disable-line Uint8Array *is* compatible with hmac.update
    hmac.update(seed.bytes);
    const hashed = hmac.digest();
    assert.equal(hashed.length, 64, 'Expected hmac to return 64 bytes');
    const privateKey = new PrivateKey(hashed.slice(0, 32), true);
    const publicKey = privateKey.toPublicKey();
    const masterChainCode = hashed.slice(32, 64);
    this._extendedPrivateKey = new ExtendedPrivateKey(
      privateKey,
      masterChainCode,
      0,
      0,
      undefined,
    );
    this._extendedPublicKey = new ExtendedPublicKey(
      publicKey,
      masterChainCode,
      0,
      0,
      undefined,
    );
  }

  derivePrivateChildFromPrivate(parent: ExtendedPrivateKey, childNumber: number): ExtendedPrivateKey {
    let hardened: boolean = childNumber >= twoPower31;
    const toHash = new Serializer();
    if (hardened) {
      toHash.addUint8(0x00);
      toHash.addBytes(parent.key.bytes);
      // $flow-disable-line Uint8Array *is* compatible with hmac.update
      hmac.update(toHash.toBytes());
    } else {
      const compressedPublicKey = generatePublicKey(parent.key, true);
      const toHash = new Serializer();
      toHash.addUint8(0x00);
      toHash.addBytes(compressedPublicKey.bytes);
      // $flow-disable-line Uint8Array *is* compatible with hmac.update
      hmac.update(toHash.toBytes());
    }
    toHash.addUint32(childNumber);
    // $flow-disable-line Uint8Array *is* compatible with hmac.create
    let hmac = createHmac('sha512', parent.chainCode);
    const hashed = hmac.digest();

    // TODO remove next 2 lines
    return this._extendedPrivateKey;
  }

  derivePublicChildFromPublic(parent: ExtendedPublicKey, childNumber: number): ExtendedPublicKey {
    // TODO remove next 2 lines
    assert(1 === 2, 'Method not  implemented yet');
    return this._extendedPublicKey;
  }

  derivePublicChildFromPrivate(parent: ExtendedPrivateKey, childNumber: number): ExtendedPublicKey {
    // TODO remove next 2 lines
    assert(1 === 2, 'Method not  implemented yet');
    return this._extendedPublicKey;
  }

}