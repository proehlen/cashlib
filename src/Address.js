// @flow
import crypto from 'crypto';

import Data from './Data';
import PublicKey from './PublicKey';
import base58 from './base58';
import Network from './Network';


export default class Address extends Data {
  toString(): string {
    return base58.encode(this.toBytes());
  }

  toPublicKeyHash(): Uint8Array {
    // Return bytes minus 1 byte version (start) and 4 byte checksum (end)
    return this.toBytes().slice(1, this.toBytes().length - 4);
  }

  static fromString(address: string) {
    return new Address(base58.decode(address));
  }

  static fromPublicKeyHash(publicKeyHash: Uint8Array, network: Network): Address {
    const versionAndHash160 = new Uint8Array(1 + publicKeyHash.length);
    versionAndHash160.set([network.prefixes.publicKeyAddress]);
    versionAndHash160.set(publicKeyHash, 1);
    const firstSha = crypto
      .createHash('sha256')
      // $flow-disable-line cipher.update accepts Uint8Array contrary to flow error
      .update(versionAndHash160)
      .digest();
    const secondSha = crypto.createHash('sha256').update(firstSha).digest();
    const addressChecksum = secondSha.slice(0, 4);

    const bytes = new Uint8Array(versionAndHash160.length + addressChecksum.length);
    bytes.set(versionAndHash160);
    bytes.set(addressChecksum, versionAndHash160.length);

    return new Address(bytes);
  }

  static fromPublicKey(publicKey: PublicKey, network: Network): Address {
    return Address.fromPublicKeyHash(publicKey.toHash160(), network);
  }
}
