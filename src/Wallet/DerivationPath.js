// @flow

/**
 * Type of {@link DerivationPath} - pubic or private key
 *
 * In the example "m/44'/0'/0'", the "m" indicates a private
 * key.  A capital "M" would represent a public key.
 */
export type DerivationPathType = 'public' | 'private';

/**
 * A single level in a {@link DerivationPath}
 *
 * In the example "m/44'/0'/0'", the "44'" and each of the
 * "0'"s represent one level
 */
export type DerivationPathLevel = {
  depth: number,
  childNumber: number,
  hardened: boolean,
};

/**
 * An array of {@link DerivationPathLevel}s
 */
export type DerivationPathLevels = Array<DerivationPathLevel>;

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
export default class DerivationPath {
  _type: DerivationPathType
  _levels: DerivationPathLevels
  _serialized: string

  /**
   * @hideconstructor
   */
  constructor(type: DerivationPathType, levels: DerivationPathLevels, serialized: string) {
    this._type = type;
    this._levels = levels;
    this._serialized = serialized;
  }

  /**
   * Returns a new path but with the type set to 'public'
   */
  toPublic() {
    return new DerivationPath(
      'public',
      this._levels,
      this._serialized,
    );
  }

  /**
   * Serializes the path into a string in the commonly used format
   *
   * E.g. returns "m/44'/0'/0'"
   */
  toSerialized(): string {
    return this._serialized;
  }

  /**
   * Creates a {@link DerivationPath} instance from a serialized string
   *
   * E.g. expects something like "m/44'/0'/0'"
   */
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
        let childNumber = parseInt(levelAndHardened[0], 10);
        if (hardened) {
          childNumber += (2 ** 31);
        }
        return {
          depth: index + 1,
          childNumber,
          hardened,
        };
      });

    return new DerivationPath(type, levels, serialized);
  }

  /**
   */
  get type(): DerivationPathType { return this._type; }

  /**
   */
  get isPrivate(): boolean { return this._type === 'private'; }

  /**
   */
  get isPublic(): boolean { return this._type === 'public'; }

  /**
   * Number of levels in this path
   */
  get numLevels(): number { return this._levels.length; }

  /**
   * {@link DerivationPathLevels} for this path
   */
  get levels(): DerivationPathLevels {
    // Return deep copy so our prop is immutable
    // (We expect returned array to be heavily modified during stack processing)
    return this._levels
      .slice()
      .map(level => Object.assign({}, level));
  }
}
