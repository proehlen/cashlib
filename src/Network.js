// @flow

declare type NetworkPrefixes = {
  publicKeyAddress: number,
  scriptAddress: number,
  privateKeyWif: number,
}

export default class Network {
  _label: string
  _prefixes: NetworkPrefixes

  constructor(label: string, prefixes: NetworkPrefixes) {
    this._label = label;
    this._prefixes = prefixes;
  }

  get label() {
    return this._label;
  }

  get prefixes() {
    return this._prefixes;
  }

  static fromString(label: string): Network {
    let prefixes: NetworkPrefixes;
    switch (label) {
      case 'main':
      case 'mainnet':
        prefixes = {
          publicKeyAddress: 0x00,
          scriptAddress: 0x05,
          privateKeyWif: 0x80,
        };
        break;
      case 'nol':
        prefixes = {
          publicKeyAddress: 0x19,
          scriptAddress: 0x44,
          privateKeyWif: 0x23,
        };
        break;
      case 'testnet':
        prefixes = {
          publicKeyAddress: 0x6f,
          scriptAddress: 0xc4,
          privateKeyWif: 0xef,
        };
        break;
      case 'regtest':
        prefixes = {
          publicKeyAddress: 0x6f,
          scriptAddress: 0xc4,
          privateKeyWif: 0xef,
        }
        break;
      default:
        throw new Error(`Unrecognized network '${label}'`);
    }

    return new Network(label, prefixes);
  }
}
