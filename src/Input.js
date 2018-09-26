// @flow

const DEFAULT_SEQUENCE = 0xfffffffe; // TODO revist when we understand

export default class Input {
  _transactionId: string;
  _outputIndex: number;
  _signatureScript: Uint8Array;
  _sequence: number;

  constructor(transactionId: string, outputIndex: number, signatureScript: Uint8Array, sequence: number = DEFAULT_SEQUENCE) {
    this._transactionId =  transactionId;
    this._outputIndex = outputIndex;
    this._signatureScript = signatureScript;
    this._sequence = sequence;
  }

  get transactionId() { return this._transactionId; }
  get outputIndex() { return this._outputIndex; }
  get signatureScript() { return this._signatureScript; }
  get sequence() { return this._sequence; }
}