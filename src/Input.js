// @flow

export default class Input {
  _transactionId: string;
  _outputIndex: number;
  _signatureScript: Uint8Array;

  constructor(transactionId: string, outputIndex: number, signatureScript: Uint8Array) {
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

  get signatureScript() {
    return this._signatureScript;
  }
}