// @flow

export default class OpCode {
  _value: number
  _mnemonic: string
  _code: () => void

  constructor(value: number, mnemonic: string, code: () => void) {
    this._value = value;
    this._mnemonic = mnemonic;
    this._code = code;
  }

  get value(): number {
    return this._value;
  }

  get mnemonic(): string {
    return this._mnemonic;
  }

  get code(): () => void {
    return this._code;
  }

}
