/**
 * Class for working with Hierarchical Deterministic (HD) Wallets per BIP-0032
 *
 * Note: this class does *not* implement BIP-0039 or BIP-0044.  See MnemonicSeed
 * and MultiAccount (coming soon) classes respectively for those functionalities.
 */
// @flow

import { createHmac } from 'crypto';
import assert from 'assert';

import ExtendedPrivateKey from './Wallet/ExtendedPrivateKey';
import Data from './Data';

export default class Wallet {
  _seed: Data
  _extendedPrivateKey: ExtendedPrivateKey

  constructor(seed: Data) {
    this._seed = seed;

    // Generate master key
    const hmac = createHmac('sha512', 'Bitcoin seed');
    // $flow-disable-line Uint8Array *is* compatible with hmac.update
    hmac.update(seed.bytes);
    const digest = hmac.digest();
    assert.equal(digest.length, 64, 'Expected hmac to return 64 bytes');
    const masterSecretKey = digest.slice(0, 32);
    const masterChainCode = digest.slice(32, 64);
    this._extendedPrivateKey = new ExtendedPrivateKey(
      masterSecretKey,
      masterChainCode,
      0,
      0,
      undefined,
    );
  }

  derivePrivateChildFromPrivate() {

  }

  derivePublicChildFromPublic() {

  }



}