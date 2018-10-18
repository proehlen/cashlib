// @flow

export type OpCodeFunction = () => void;

/**
 * A Bitcoin script opcode
 */
export default class OpCode {
  _value: number
  _mnemonic: string
  _code: OpCodeFunction

  constructor(value: number, mnemonic: string, code: OpCodeFunction) {
    this._value = value;
    this._mnemonic = mnemonic;
    this._code = code;
  }

  /**
   * Value of this opcode
   */
  get value(): number {
    return this._value;
  }

  /**
   * Mnemonic associatd with this opcode
   */
  get mnemonic(): string {
    return this._mnemonic;
  }

  /**
   * Function that executes when this opcode runs
   */
  get code(): OpCodeFunction {
    return this._code;
  }
}
