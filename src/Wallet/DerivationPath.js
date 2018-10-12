/**
 * Class for handling BIP32 derivation paths - a method of specifying a private
 * or public extended key in a key tree.
 * 
 * A derivation path is a string in the format of format "m/n'/n'/n'" where:
 *
 *   m or M   is a literal.  Lowercase is a private key; uppercase is public key
 *   /        is a literal indicatating is an optional level (zero or more)
 *   n        the child key number in the current level
 *   '        optionally nominates the suffixed child key as hardened (subscript 'H' is the 
 *            notation used in the BIP but apostrophe suffix is the public convention)
 */
// @flow

import { containsOnly } from 'stringfu';

export type DerivationPathType = 'public' | 'private';

export type DerivationPathLevel = {
  depth: number,
  childNumber: number,
  hardened: boolean,
};

export type DerivationPathLevels = Array<DerivationPathLevel>;

export default class DerivationPath {
  _type: DerivationPathType
  _levels: DerivationPathLevels
  _serialized: string

  constructor(type: DerivationPathType, levels: DerivationPathLevels, serialized: string) {
    this._type = type;
    this._levels = levels;
    this._serialized = serialized; 
  }
  
  toPublic() {
    return new DerivationPath(
      'public',
      this._levels,
      this._serialized
    );
  }

  toSerialized(): string {
    return this._serialized;
  }

  static fromSerialized(serialized: string): DerivationPath {
    // Determine type
    const typeKey = serialized.substr(0, 1);
    let type: DerivationPathType;
    switch (typeKey) {
      case 'm':
        type = 'private';
        break;
      case 'M':
        type = 'public';
        break;
      default:
        throw new Error('Derivation path must begin with "m" or "M".');
    }

    // Decode levels
    const levels: DerivationPathLevels = serialized
      .substr(1)
      .replace(/'/g, ",'")
      .split('/')
      .filter(rec => rec !== '')
      .map((encodedLevel, index) => {
        const levelAndHardened = encodedLevel.split(',');
        const hardened = levelAndHardened[1] !== undefined && levelAndHardened[1] === "'";
        let childNumber = parseInt(levelAndHardened[0]);
        if (hardened) {
          childNumber = childNumber + (2 ** 31);
        }
        return {
          depth: index + 1,
          childNumber,
          hardened,
        };
      });

    return new DerivationPath(type, levels, serialized);
  }

  get type() { return this._type; }
  get isPrivate() { return this._type === 'private'; }
  get isPublic() { return this._type === 'public'; }
  get numLevels() { return this._levels.length; }
  get levels(): DerivationPathLevels {
    // Return deep copy so our prop is immutable 
    // (We expect returned array to be heavily modified during stack processing)
    return this._levels
      .slice()
      .map(level => Object.assign({}, level));
  }
}