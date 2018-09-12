// @flow

export default class Output {
  _value: number
  _pubKeyScript: Uint8Array 

  constructor(value: number, pubKeyScript: Uint8Array) {
    this._value = value;
    this._pubKeyScript = pubKeyScript;
  }
}