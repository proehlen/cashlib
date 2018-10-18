// @flow

const DEFAULT_SEQUENCE = 0xfffffffe; // TODO revist when we understand

/**
 * A transaction input
 */
export default class Input {
  _transactionId: string;
  _outputIndex: number;
  _signatureScript: Uint8Array;
  _sequence: number;

  constructor(
    transactionId: string,
    outputIndex: number,
    signatureScript: Uint8Array,
    sequence: number = DEFAULT_SEQUENCE,
  ) {
    this._transactionId = transactionId;
    this._outputIndex = outputIndex;
    this._signatureScript = signatureScript;
    this._sequence = sequence;
  }

  /**
   * The id of the {@link Transaction} containing the output that this input spends
   */
  get transactionId(): string { return this._transactionId; }

  /**
   * The index of the output that this input spends
   */
  get outputIndex(): number { return this._outputIndex; }

  /**
   * The signature script (aka `scriptSig`) for this input
   */
  get signatureScript(): Uint8Array { return this._signatureScript; }

  /**
   * The input {@link https://bitcoin.org/en/glossary/sequence-number sequence number}
   */
  get sequence(): number { return this._sequence; }

  /**
   * Returns true if this input is the {@link https://bitcoin.org/en/glossary/coinbase-transaction coinbase} input
   */
  get isCoinbase(): boolean { return this._outputIndex === 0xFFFFFFFF; }
}
