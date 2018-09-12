// @flow

export default class Input {
  _transactionId: Uint8Array;
  _outputIndex: number;
  _signatureScript: Uint8Array;

  constructor(transactionId: Uint8Array, outputIndex: number, signatureScript: Uint8Array) {
    this._transactionId =  transactionId;
    this._outputIndex = outputIndex;
    this._signatureScript = signatureScript;
  }

  get transactionId() {
    return this._transactionId;
  }

  get outputIndex() {
    return this._outputIndex;
  }
}