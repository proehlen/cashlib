// @flow

export type Network = {
  prefixes: {
    publicKeyAddress: number,
    scriptAddress: number,
    privateKeyWif: number,
  }
}

export const mainnet: Network = {
  prefixes: {
    publicKeyAddress: 0x00,
    scriptAddress: 0x05,
    privateKeyWif: 0x80,
  }
};

export const nol: Network = {
  prefixes: {
    publicKeyAddress: 0x19,
    scriptAddress: 0x44,
    privateKeyWif: 0x23,
  }
}

export const testnet: Network = {
  prefixes: {
    publicKeyAddress: 0x6f,
    scriptAddress: 0xc4,
    privateKeyWif: 0xef,
  }
}

export const regtest: Network = {
  prefixes: {
    publicKeyAddress: 0x6f,
    scriptAddress: 0xc4,
    privateKeyWif: 0xef,
  }
}