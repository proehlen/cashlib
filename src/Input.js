// @flow

export default class Input {
  _utxoTxId: Uint8Array;
  _utxoIndex: number;
  _signatureScript: Uint8Array;

  constructor(utxoTxId: Uint8Array, utxoIndex: number, signatureScript: Uint8Array) {
    this._utxoTxId =  utxoTxId;
    this._utxoIndex = utxoIndex;
    this._signatureScript = signatureScript;
  }
}