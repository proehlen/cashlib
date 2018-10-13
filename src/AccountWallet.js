/**
 * Wallet for a single account derived from a BIP-0044 path
 * 
 * This class internally creates sub-wallets for and facilitates issuing of
 * external (public receiving) and internal (change) addresses.  It is up to
 * the client implementation to determine whether addresses have been
 * previously used (ie by scanning the blockchain) and calling setUsedAddressIndex()
 * accordingly.
 */
// @flow

import assert from 'assert';

import Address from './Address';
import Data from './Data';
import DerivationPath from './Wallet/DerivationPath';
import MnemonicSeed from './MnemonicSeed';
import Network from './Network';
import Wallet from './Wallet';

// Path level constants
const purposeBip44 = 44 + (2 ** 31); // 44 in hardened range
const bitcoin = 0 + (2 ** 31); // 0 in hardened range
const testnet = 1 + (2 ** 31); // 1 in hardened range
const bitcoinCash = 145 + (2 ** 31); // 145 in hardened range
const coinTypes = [bitcoin, testnet, bitcoinCash];

export type AccountWalletAddressType = 'internal' | 'external';

export default class AccountWallet {
  _internalWallet: Wallet
  _externalWallet: Wallet
  _internalUsed: ?number // Used change address index
  _externalUsed: ?number // Used external address index

  constructor(externalWallet: Wallet, internalWallet: Wallet) {
    this._externalWallet = externalWallet;
    this._internalWallet = internalWallet;
  }

  setUsedAddressIndex(type: AccountWalletAddressType, addressIndex:number) {
    if (type === 'external') {
      this._externalUsed = addressIndex;
    } else {
      this._internalUsed = addressIndex;
    }
  }

  /**
   * Returns next/first unused external shareable public key as an address
   *
   * This address can be shared publicly to receive payments
   */
  nextExternalAddress(network: Network): Address {
    let address: Address;
    const nextIndex: number = this._externalUsed !== undefined 
      ? this._externalUsed + 1
      : 0;
    this._externalUsed = nextIndex;
    const path = DerivationPath.fromSerialized(`M${nextIndex}`);
    const publicKey = this._externalWallet.getKey(path).getPublicKey();
    return Address.fromPublicKey(publicKey, network);
  }

  /**
   * Returns next/first unused internal change public key as an address
   * 
   * This address should be used by wallet software to receive change
   */
  nextInternalAddress(network: Network): Address {
    let address: Address;
    const nextIndex: number = this._internalUsed !== undefined 
      ? this._internalUsed + 1
      : 0;
    this._internalUsed = nextIndex;
    const path = DerivationPath.fromSerialized(`M/${nextIndex}`);
    const publicKey = this._internalWallet.getKey(path).getPublicKey();
    return Address.fromPublicKey(publicKey, network);
  }

  static fromSeed(seed: Data, accountPath: DerivationPath): AccountWallet {
    
    // Validate derivation path (require BIP44 format)
    const exampleText = `(e.g.  m44'0'0')`;
    assert (accountPath.numLevels === 3, `Expected a 3 level derivation path ${exampleText}`);
    assert (accountPath.isPrivate, `Expected derivation path to begin with 'm' (private)`);
    const firstIndex = accountPath.levels[0].childNumber; 
    assert (firstIndex === purposeBip44, `Expected first derivation path level to be 44 ${exampleText}`);
    const secondIndex = accountPath.levels[1].childNumber; 
    assert (coinTypes.indexOf(secondIndex) > -1, `Unrecognized coin type (${secondIndex})`);

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
