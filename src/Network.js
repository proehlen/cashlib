// @flow

declare type NetworkPrefixes = {
  publicKeyAddress: number,
  scriptAddress: number,
  privateKeyWif: number,
  extendedKeyVersion:  {
    public: Uint8Array,
    private: Uint8Array,
  },
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
          extendedKeyVersion: {
            public: new Uint8Array([0x04, 0x88, 0xB2, 0x1E]),
            private: new Uint8Array([0x04, 0x88, 0xAD, 0xE4]),
          }
        };
        break;
      case 'nol':
        prefixes = {
          publicKeyAddress: 0x19,
          scriptAddress: 0x44,
          privateKeyWif: 0x23,
          extendedKeyVersion: {
            public: new Uint8Array([0x42, 0x69, 0x67, 0x20]),
            private: new Uint8Array([0x42, 0x6c, 0x6b, 0x73]),
          }
        };
        break;
      case 'testnet':
        prefixes = {
          publicKeyAddress: 0x6f,
          scriptAddress: 0xc4,
          privateKeyWif: 0xef,
          extendedKeyVersion: {
            public: new Uint8Array([0x04, 0x35, 0x87, 0xCF]),
            private: new Uint8Array([0x04, 0x35, 0x83, 0x94]),
          }
        };
        break;
      case 'regtest':
        prefixes = {
          publicKeyAddress: 0x6f,
          scriptAddress: 0xc4,
          privateKeyWif: 0xef,
          extendedKeyVersion: {
            public: new Uint8Array([0x04, 0x35, 0x87, 0xCF]),
            private: new Uint8Array([0x04, 0x35, 0x83, 0x94]),
          }
        }
        break;
      default:
        throw new Error(`Unrecognized network '${label}'`);
    }

    return new Network(label, prefixes);
  }
}
