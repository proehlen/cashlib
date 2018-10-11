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
import * as stringfu from 'stringfu';

import CurvePoint from './CurvePoint';
import DerivationPath from './Wallet/DerivationPath';
import PrivateKey from './PrivateKey';
import PublicKey from './PublicKey';
import ExtendedKey from './Wallet/ExtendedKey';
import Data from './Data';
import Serializer from './Serializer';
import secp256k1 from './secp256k1';

const twoPower31 = 2 ^ 31;

export default class Wallet {
  _masterPublicKey: ExtendedKey
  _masterPrivateKey: ?ExtendedKey

  constructor(masterPublicKey: ExtendedKey, masterPrivateKey?: ExtendedKey) {
    this._masterPrivateKey = masterPrivateKey;
    this._masterPublicKey = masterPublicKey;
  }

  getMasterPublicKey() { return this._masterPublicKey; }
  getMasterPrivateKey(): ExtendedKey {
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
    const publicKey = privateKey.toPublicKey(true);
    const masterChainCode = hashed.slice(32, 64);
    const noParentFingerprint = new Uint8Array([0x00, 0x00, 0x00, 0x00]);
    const masterPrivateKey = new ExtendedKey(
      privateKey,
      masterChainCode,
      0,
      0,
      noParentFingerprint,
    );
    const masterPublicKey = new ExtendedKey(
      publicKey,
      masterChainCode,
      0,
      0,
      noParentFingerprint,
    );
    return new Wallet(masterPublicKey, masterPrivateKey);
  }

  getKey(path: DerivationPath): ExtendedKey {
    let result;
    if (!path.numLevels) {
      // Return master key
      if (path.isPrivate) {
        result = this.getMasterPrivateKey();
      } else {
        result = this.getMasterPublicKey();
      }
    } else {
      // TODO REPLACE
      throw new Error('Child key derivation not implemented yet');
    }
    // } else if (path.isPrivate) {
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

    return result;
  }

  /**
   * BIP-0032 function CKDpriv((kpar, cpar), i) → (ki, ci) computes a child extended
   * private key from the parent extended private key
   * 
   * TODO Pre-beta: Ensure we are handling this edge case:
   * "In case parse256(IL) ≥ n or ki = 0, the resulting key is invalid, and one should
   * proceed with the next value for i. (Note: this has probability lower than 1 in 2127.)"
   */
  _derivePrivateChildFromPrivate(parent: ExtendedKey, childDepth: number, childNumber: number): ExtendedKey {
    // Serialize data to be hashed
    let hardened: boolean = childNumber >= twoPower31;
    const toHash = new Serializer();
    if (hardened) {
      toHash.addUint8(0x00); // Pad parent key to 33 bytes
      toHash.addBytes(parent.key.bytes);
    } else {
      const compressedPublicKey = parent.getPrivateKey().toPublicKey(true);
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
    const newKeyBytes = new Uint8Array(
      BigInt
        .fromArray(Array.from(hashedLeft), 256, false)
        .add(parent.key.toBigInt())
        .mod(secp256k1.order)
        .toArray(256)
        .value
    );
    const newChaincodeBytes = hashedRight;

    // Get parent fingerprint (first four bytes) of parent identifier (ie hash160'd public key)
    // TODO performance: recreating public key is slow - consider requiring it as a parameter
    const parentFingerPrint = parent
      .getPrivateKey()
      .toPublicKey(true)
      .toHash160()
      .slice(0, 4);

    // Build and return key
    return new ExtendedKey(
      new PrivateKey(newKeyBytes), // Will throw exception < 1 in 2^127 cases
      newChaincodeBytes,
      childDepth,
      childNumber,
      parentFingerPrint,
    );
  }
  
  /**
   * BIP-0032 function N((k, c)) → (K, c) computes the extended public key corresponding
   * to an extended private key
   */
  _derivePublicChildFromPrivate(parent: ExtendedKey, childDepth: number, childNumber: number): ExtendedKey {
    const privateChildExtended = this._derivePrivateChildFromPrivate(parent, childDepth, childNumber);
    let publicChild: PublicKey;
    if (privateChildExtended.key instanceof PrivateKey) {
      publicChild = privateChildExtended.key.toPublicKey(true);
    } else {
      throw new Error('Unexpected result in child public key derivation.')
    }
    return new ExtendedKey(
      publicChild,
      privateChildExtended.chainCode,
      childDepth,
      childNumber,
      privateChildExtended.parentFingerprint,
    );
  }

  /**
   * BIP-0032 function CKDpub((Kpar, cpar), i) → (Ki, ci) computes a child extended
   * public key from the parent extended public key. It only works for non-hardened
   * child keys.
   * 
   * TODO Pre-beta: Ensure we are handling this edge case:
   * "In case parse256(IL) ≥ n or Ki is the point at infinity, the resulting key is
   * invalid, and one should proceed with the next value for i."
   */
  _derivePublicChildFromPublic(parent: ExtendedKey, childDepth: number, childNumber: number): ExtendedKey {
    // Serialize data to be hashed
    let hardened: boolean = childNumber >= twoPower31;
    const toHash = new Serializer();
    if (hardened) {
      throw new Error('Not possible to derive hardened child from public key.')
    } else {
      toHash.addBytes(parent.getPublicKey().bytes);
    }
    toHash.addUint32(childNumber);

    // Hash serialized data
    // $flow-disable-line Uint8Array *is* compatible with hmac.create
    let hmac = createHmac('sha512', parent.chainCode);
    // $flow-disable-line Uint8Array *is* compatible with hmac.update
    hmac.update(toHash.toBytes());
    const hashed = hmac.digest();
    const hashedLeft = new Data(hashed.slice(0, 32));
    const hashedRight = new Data(hashed.slice(32, 64));

    // Build new key bytes
    const exponent = hashedLeft.toBigInt().mod(secp256k1.order);
    const pointA = CurvePoint.fromBigInt(exponent);
    const parentPoint = parent.getPublicKey().toCurvePoint();
    const point = CurvePoint.add(pointA, parentPoint);
    const newKeyBytes = point.toBytes(true);

    // Build new chaincode bytes
    const newChaincodeBytes = hashedRight.bytes;

    // Get parent fingerprint (first four bytes) of parent identifier (ie hash160'd public key)
    const parentFingerPrint = parent
      .getPublicKey()
      .toHash160()
      .slice(0, 4);

    // Build and return key
    return new ExtendedKey(
      new PublicKey(newKeyBytes),
      newChaincodeBytes,
      childDepth,
      childNumber,
      parentFingerPrint,
    );
  }
}
