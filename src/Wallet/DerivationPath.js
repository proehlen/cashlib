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
  _path: string
  _type: DerivationPathType
  _levels: DerivationPathLevels

  constructor(path: string) {
    this._path = path;

    // Determine type
    const typeKey = path.substr(0, 1);
    switch (typeKey) {
      case 'm':
        this._type = 'private';
        break;
      case 'M':
        this._type = 'public';
        break;
      default:
        throw new Error('Derivation path must begin with "m" or "M".');
    }

    // Decode levels
    this._levels = path
      .substr(1)
      .replace("'", ",'")
      .split('/')
      .filter(rec => rec !== '')
      .map((encodedLevel, index) => {
        const levelAndHardened = encodedLevel.split(',');
        return {
          depth: index + 1,
          childNumber: parseInt(levelAndHardened[0]),
          hardened: levelAndHardened[1] !== undefined && levelAndHardened[1] === "'",
        };
      });
  }

  get path() { return this._path; }
  get type() { return this._type; }
  get levels(): DerivationPathLevels {
    // Return deep copy so our prop is immutable 
    // (We expect returned array to be heavily modified during stack processing)
    return this._levels
      .slice()
      .map(level => Object.assign({}, level));
  }
}