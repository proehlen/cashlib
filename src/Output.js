// @flow
import opCodes from './opCodes';
import Address from './Address';
import Network from './Network';
import PublicKey from './PublicKey';

export default class Output {
  _value: number
  _pubKeyScript: Uint8Array
  _scriptType: 'P2PK' | 'P2PKH' | 'unknown'

  constructor(value: number, pubKeyScript: Uint8Array) {
    this._value = value;
    this._pubKeyScript = pubKeyScript;

    // Determine script type (TODO handle other types and efficiency improvements)
    if (pubKeyScript[0] === opCodes.OP_DUP.value
        && pubKeyScript[1] === opCodes.OP_HASH160.value
        && pubKeyScript[pubKeyScript.length - 2] === opCodes.OP_EQUALVERIFY.value
        && pubKeyScript[pubKeyScript.length - 1] === opCodes.OP_CHECKSIG.value) {
      this._scriptType = 'P2PKH';
    } else if (pubKeyScript[0] >= 0x01
        && pubKeyScript[0] <= 0x4b
        && pubKeyScript[pubKeyScript[0] + 1] === opCodes.OP_CHECKSIG.value) {
      this._scriptType = 'P2PK';
    } else {
      this._scriptType = 'unknown';
    }
  }

  get value() {
    return this._value;
  }

  get pubKeyScript() {
    return this._pubKeyScript;
  }

  get scriptType() {
    return this._scriptType;
  }

  getAddress(network: Network): Address | void {
    let address: Address | void;
    if (this.scriptType === 'P2PKH') {
      // TODO rewrite this after we are deserializing scripts
      const hashStart = 3; // OP_DUP + OP_HASH160 + OP_PUSHx
      const hashEnd = this._pubKeyScript.length - 2; // OP_EQUALVERIFY + OP_CHECKSIG
      const hash = this._pubKeyScript.slice(hashStart, hashEnd);
      address = Address.fromPublicKeyHash(hash, network);
    } else if (this.scriptType === 'P2PK') {
      const keyStart = 1; // push data 1 to 75
      const keyEnd = this._pubKeyScript.length - 1; // OP_CHECKSIG
      const keyBytes = this._pubKeyScript.slice(keyStart, keyEnd);
      const publicKey = new PublicKey(keyBytes);
      address = Address.fromPublicKey(publicKey, network);
    }
    return address;
  }

  /**
   * Generate and return a new Pay to Public Key Hash output
   */
  static createP2PKH(address: string, value: number): Output {
    const addr = Address.fromString(address);
    const pubKeyHash = addr.toPublicKeyHash();
    const pubKeyScript: Uint8Array = new Uint8Array(pubKeyHash.length + 5);
    pubKeyScript.set([opCodes.OP_DUP.value], 0);
    pubKeyScript.set([opCodes.OP_HASH160.value], 1);
    pubKeyScript.set([pubKeyHash.length], 2);
    pubKeyScript.set(pubKeyHash, 3);
    pubKeyScript.set([opCodes.OP_EQUALVERIFY.value], pubKeyHash.length + 3);
    pubKeyScript.set([opCodes.OP_CHECKSIG.value], pubKeyHash.length + 4);
    return new Output(value, pubKeyScript);
  }
}
