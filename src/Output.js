// @flow
import opCodes from './opCodes';
import Address from './Address';
import Network from './Network';
import PublicKey from './PublicKey';
import Script from './Script';

export type OutputScriptType = 'P2PK' | 'P2PKH' | 'P2SH' | 'unknown';

/**
 * A transaction output
 */
export default class Output {
  _value: number
  _pubKeyScript: Script

  constructor(value: number, pubKeyScript: Script) {
    this._value = value;
    this._pubKeyScript = pubKeyScript;
  }

  /**
   * The value in Satoshis for this output
   */
  get value(): number {
    return this._value;
  }

  /**
   * The public key script (aka 'ScriptPubKey') for this output
   */
  get pubKeyScript(): Script {
    return this._pubKeyScript;
  }

  /**
   * The type of output script for this output
   */
  get scriptType(): OutputScriptType {
    let scriptType: OutputScriptType = 'unknown';

    const bytes = this.pubKeyScript.toBytes();

    // Determine script type (TODO handle other types and efficiency improvements)
    if (bytes[0] === opCodes.OP_DUP.value
        && bytes[1] === opCodes.OP_HASH160.value
        && bytes[bytes.length - 2] === opCodes.OP_EQUALVERIFY.value
        && bytes[bytes.length - 1] === opCodes.OP_CHECKSIG.value) {
      scriptType = 'P2PKH';
    } else if (bytes[0] >= 0x01
        && bytes[0] <= 0x4b
        && bytes[bytes[0] + 1] === opCodes.OP_CHECKSIG.value) {
      scriptType = 'P2PK';
    } else if (bytes.length === 23
        && bytes[0] === opCodes.OP_HASH160.value
        && bytes[1] === 20
        && bytes[bytes.length - 1] === opCodes.OP_EQUAL.value) {
      scriptType = 'P2SH';
    } else {
      scriptType = 'unknown';
    }
    return scriptType;
  }

  /**
   * Return a Bitcoin address for this output
   */
  getAddress(network: Network): Address | void {
    let address: Address | void;
    const scriptBytes = this._pubKeyScript.toBytes();
    if (this.scriptType === 'P2PKH') {
      // TODO rewrite this after we are deserializing scripts
      const hashStart = 3; // OP_DUP + OP_HASH160 + OP_PUSHx
      const hashEnd = scriptBytes.length - 2; // OP_EQUALVERIFY + OP_CHECKSIG
      const hash = scriptBytes.slice(hashStart, hashEnd);
      address = Address.fromPublicKeyHash(hash, network);
    } else if (this.scriptType === 'P2PK') {
      const keyStart = 1; // push data 1 to 75
      const keyEnd = scriptBytes.length - 1; // OP_CHECKSIG
      const keyBytes = scriptBytes.slice(keyStart, keyEnd);
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
    const scriptBytes: Uint8Array = new Uint8Array(pubKeyHash.length + 5);
    scriptBytes.set([opCodes.OP_DUP.value], 0);
    scriptBytes.set([opCodes.OP_HASH160.value], 1);
    scriptBytes.set([pubKeyHash.length], 2);
    scriptBytes.set(pubKeyHash, 3);
    scriptBytes.set([opCodes.OP_EQUALVERIFY.value], pubKeyHash.length + 3);
    scriptBytes.set([opCodes.OP_CHECKSIG.value], pubKeyHash.length + 4);
    return new Output(value, new Script(scriptBytes));
  }
}
