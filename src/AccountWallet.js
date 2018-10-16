// @flow

import assert from 'assert';

import Address from './Address';
import Data from './Data';
import DerivationPath from './Wallet/DerivationPath';
import Network from './Network';
import Wallet from './Wallet';

// Path level constants
const purposeBip44 = 44 + (2 ** 31); // 44 in hardened range
const bitcoin = 0 + (2 ** 31); // 0 in hardened range
const testnet = 1 + (2 ** 31); // 1 in hardened range
const bitcoinCash = 145 + (2 ** 31); // 145 in hardened range
const coinTypes = [bitcoin, testnet, bitcoinCash];

/**
 * Type of wallet address for an {@link AccountWallet}
 *
 * Internal addresses are used by the wallet implementation to recieve
 * change and are not ordinarily shared. External addresses are for
 * receiving payments and are shared with the sender.
 */
export type AccountWalletAddressType = 'internal' | 'external';

/**
 * Wallet for a single account derived from a BIP-0044 {@link DerivationPath}
 *
 * This class internally creates sub-wallets for and facilitates issuing of
 * external (public receiving) and internal (change) addresses.  It will track
 * addresses used (issued) for any addresses issued with the `nextExternalAddress` and
 * `nextInternalAddress` methods - ie, it won't reissue the same address.  However,
 * it is up to the client implementation to determine whether addresses have been
 * used prior to instantiation (ie by scanning the blockchain) and calling
 * `setUsedAddressIndex` accordingly.
 */
export default class AccountWallet {
  _internalWallet: Wallet
  _externalWallet: Wallet
  _internalUsedIndex: number // Used change address index
  _externalUsedIndex: number // Used external address index

  /**
   * @hideconstructor
   */
  constructor(externalWallet: Wallet, internalWallet: Wallet) {
    this._externalWallet = externalWallet;
    this._externalUsedIndex = -1;
    this._internalWallet = internalWallet;
    this._internalUsedIndex = -1;
  }

  /**
   * Return highest used address index for nominated type
   */
  getUsedAddressIndex(type: AccountWalletAddressType): number {
    return (type === 'external')
      ? this._externalUsedIndex
      : this._internalUsedIndex;
  }

  /**
   * Update the highest used address index for the nominated type
   */
  setUsedAddressIndex(type: AccountWalletAddressType, addressIndex: number): void {
    if (type === 'external') {
      this._externalUsedIndex = addressIndex;
    } else {
      this._internalUsedIndex = addressIndex;
    }
  }

  /**
   * Returns next/first unused external shareable public key as an address
   *
   * This address can be shared publicly to receive payments
   */
  nextExternalAddress(network: Network): Address {
    this._externalUsedIndex += 1;
    const path = DerivationPath.fromSerialized(`M${this._externalUsedIndex}`);
    const publicKey = this._externalWallet.getKey(path).getPublicKey();
    return Address.fromPublicKey(publicKey, network);
  }

  /**
   * Returns next/first unused internal change public key as an address
   *
   * This address should be used by wallet software to receive change
   */
  nextInternalAddress(network: Network): Address {
    this._internalUsedIndex += 1;
    const path = DerivationPath.fromSerialized(`M/${this._internalUsedIndex}`);
    const publicKey = this._internalWallet.getKey(path).getPublicKey();
    return Address.fromPublicKey(publicKey, network);
  }

  /**
   * Create new AccountWallet instance using a seed and BIP44 derivation path
   */
  static fromSeed(seed: Data, accountPath: DerivationPath): AccountWallet {
    // Validate derivation path (require BIP44 format)
    const exampleText = "(e.g.  m44'0'0')";
    assert(accountPath.numLevels === 3, `Expected a 3 level derivation path ${exampleText}`);
    assert(accountPath.isPrivate, "Expected derivation path to begin with 'm' (private)");
    const firstIndex = accountPath.levels[0].childNumber;
    assert(firstIndex === purposeBip44, `Expected first derivation path level to be 44 ${exampleText}`);
    const secondIndex = accountPath.levels[1].childNumber;
    assert(coinTypes.indexOf(secondIndex) > -1, `Unrecognized coin type (${secondIndex})`);

    // Generate master wallet
    const masterWallet = Wallet.fromSeed(seed);

    // Get keys for and create account wallet
    const accountPrivateKey = masterWallet.getKey(accountPath);
    const accountPublicKey = masterWallet.getKey(accountPath.toPublic());
    const accountWallet = new Wallet(accountPublicKey, accountPrivateKey);

    // Get keys for and create external / receiving wallet
    const externalPath = DerivationPath.fromSerialized('m/0');
    const externalPrivateKey = accountWallet.getKey(externalPath);
    const externalPublicKey = accountWallet.getKey(externalPath.toPublic());
    const externalWallet = new Wallet(externalPublicKey, externalPrivateKey);

    // Get keys for and create internal / change wallet
    const internalPath = DerivationPath.fromSerialized('m/1');
    const internalPrivateKey = accountWallet.getKey(internalPath);
    const internalPublicKey = accountWallet.getKey(internalPath.toPublic());
    const internalWallet = new Wallet(internalPublicKey, internalPrivateKey);

    return new AccountWallet(externalWallet, internalWallet);
  }
}
