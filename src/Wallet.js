/**
 * Class for working with Hierarchical Deterministic (HD) Wallets per BIP-0032
 *
 * Note: this class does *not* implement BIP-0039 or BIP-0044.  See MnemonicSeed
 * and MultiAccount (coming soon) classes respectively for those functionalities.
 */
// @flow

import { createHmac } from 'crypto';
import assert from 'assert';
import BigInt from 'big-integer';

import DerivationPath from './Wallet/DerivationPath';
import PrivateKey from './PrivateKey';
import PublicKey from './PublicKey';
import ExtendedPrivateKey from './Wallet/ExtendedPrivateKey';
import ExtendedPublicKey from './Wallet/ExtendedPublicKey';
import Data from './Data';
import Serializer from './Serializer';
import { generatePublicKey } from './PrivateKey/secp256k1';
import { prime } from './PrivateKey/secp256k1';

const twoPower31 = 2 ^ 31;

export default class Wallet {
  _masterPublicKey: ExtendedPublicKey
  _masterPrivateKey: ?ExtendedPrivateKey

  constructor(masterPublicKey: ExtendedPublicKey, masterPrivateKey?: ExtendedPrivateKey) {
    this._masterPrivateKey = masterPrivateKey;
    this._masterPublicKey = masterPublicKey;
  }

  getMasterPublicKey() { return this._masterPublicKey; }
  getMasterPrivateKey(): ExtendedPrivateKey {
    if (this._masterPrivateKey) {
      return this._masterPrivateKey;
    } else {
      throw new Error('Master private key is not known by this wallet.');
    }
  }

  static fromSeed(seed: Data): Wallet {
    // Generate master key
    const hmac = createHmac('sha512', 'Bitcoin seed');
    // $flow-disable-line Uint8Array *is* compatible with hmac.update
    hmac.update(seed.bytes);
    const hashed = hmac.digest();
    assert.equal(hashed.length, 64, 'Expected hmac to return 64 bytes');
    const privateKeyBytes = new Uint8Array(hashed.slice(0, 32));
    const privateKey = new PrivateKey(privateKeyBytes, true);
    const publicKey = privateKey.toPublicKey();
    const masterChainCode = hashed.slice(32, 64);
    const masterPrivateKey = new ExtendedPrivateKey(
      privateKey,
      masterChainCode,
      0,
      0,
      new Uint8Array([0x00, 0x00, 0x00, 0x00]), // No parent, no fingerprint
    );
    const masterPublicKey = new ExtendedPublicKey(
      publicKey,
      masterChainCode,
      0,
      0,
      undefined,
    );
    return new Wallet(masterPublicKey, masterPrivateKey);
  }

  // getChildKey(path: DerivationPath): ExtendedPublicKey | ExtendedPrivateKey | void {
  //   let result;
  //   if (!path.numLevels) {
  //     // Return master key
  //     if (path.isPrivate) {
  //       result = this._extendedPrivateKey;
  //     } else {
  //       result = this._extendedPublicKey;
  //     }
  //   } else if (path.isPrivate) {
  //     // Walk key tree to get requested private key
  //     const levels = path.levels;
  //     let parent = this.extendedPrivateKey;
  //     for (let i = 0; i < path.numLevels; i++) {
  //       const level = levels[i];
  //       result = this._derivePrivateChildFromPrivate(parent, level.childNumber);
  //       parent = result;
  //     }
  //   } else {
  //     // Walk key tree to get requested public key

  //   }

  //   return result;
  // }

  _derivePrivateChildFromPrivate(parent: ExtendedPrivateKey, childNumber: number): ExtendedPrivateKey {
    // Serialize data to be hashed
    let hardened: boolean = childNumber >= twoPower31;
    const toHash = new Serializer();
    if (hardened) {
      toHash.addUint8(0x00); // Pad parent key to 33 bytes
      toHash.addBytes(parent.key.bytes);
    } else {
      const compressedPublicKey = generatePublicKey(parent.key, true);
      toHash.addBytes(compressedPublicKey.bytes);
    }
    toHash.addUint32(childNumber);

    // Hash serialized data
    // $flow-disable-line Uint8Array *is* compatible with hmac.create
    let hmac = createHmac('sha512', parent.chainCode);
    // $flow-disable-line Uint8Array *is* compatible with hmac.update
    hmac.update(toHash.toBytes());
    const hashed = hmac.digest();

    // Build new key components
    const hashedLeft = hashed.slice(0, 32);
    const hashedRight = hashed.slice(32, 64);
    const newKeyBytes = BigInt
      .fromArray(Array.from(hashedLeft), 256, false)
      .add(parent.key.toBigInt())
      .mod(prime);
    const newChaincodeBytes = hashedRight;

    // Get parent fingerprint (first four bytes) of parent identifier (ie hash160'd public key)
    // TODO performance: recreating public key is slow - consider requiring it as a parameter
    const parentFingerPrint = parent.key.toPublicKey().toHash160().slice(0, 4);

    // Build and return key
    return new ExtendedPrivateKey(
      new PrivateKey(newKeyBytes), // Will throw exception < 1 in 2^127 cases
      newChaincodeBytes,
      1, // TODO - FIX DEPTH
      childNumber,
      parentFingerPrint,
    );
  }

  // _derivePublicChildFromPublic(parent: ExtendedPublicKey, childNumber: number): ExtendedPublicKey {
  //   // TODO replace next 2 lines
  //   assert(1 === 2, 'Method not  implemented yet');
  //   return this._extendedPublicKey;
  // }

  // _derivePublicChildFromPrivate(parent: ExtendedPrivateKey, childNumber: number): ExtendedPublicKey {
  //   // TODO replace next 2 lines
  //   assert(1 === 2, 'Method not  implemented yet');
  //   return this._extendedPublicKey;
  // }

}