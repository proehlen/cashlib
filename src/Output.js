// @flow
import opCodes from './opCodes';
import Address from './Address';
import Network from './Network';

export default class Output {
  _value: number
  _pubKeyScript: Uint8Array 
  _scriptType: 'P2PK' | 'P2PKH' | 'unkown'

  constructor(value: number, pubKeyScript: Uint8Array) {
    this._value = value;
    this._pubKeyScript = pubKeyScript;

    // Determine script type (TODO handle other types and efficiency improvements)
    if (pubKeyScript[0] === opCodes.OP_DUP.value &&
        pubKeyScript[1] === opCodes.OP_HASH160.value &&
        pubKeyScript[pubKeyScript.length - 2] === opCodes.OP_EQUALVERIFY.value &&
        pubKeyScript[pubKeyScript.length - 1] === opCodes.OP_CHECKSIG.value) {
      this._scriptType = 'P2PKH';
    } else if (pubKeyScript[0] >= 0x01
        && pubKeyScript[0] <= 0x4b
        && pubKeyScript[pubKeyScript[0] + 1] === opCodes.OP_CHECKSIG.value) {
      this._scriptType = 'P2PK';
    } else {
      this._scriptType = 'unkown';
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
      address = new Address.fromPublicKeyHash(hash, network);
    }
    return address;
  }

}