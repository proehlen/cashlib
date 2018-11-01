// @flow
import { type DataFrom } from './Data';
import TransactionId from './TransactionId';
import Script from './Script';

const DEFAULT_SEQUENCE = 0xfffffffe; // TODO revist when we understand

/**
 * A transaction input
 */
export default class Input {
  _transactionId: TransactionId;
  _outputIndex: number;
  _signatureScript: Script;
  _sequence: number;

  constructor(
    transactionId: DataFrom,
    outputIndex: number,
    signatureScript: Script,
    sequence: number = DEFAULT_SEQUENCE,
  ) {
    this._transactionId = new TransactionId(transactionId);
    this._outputIndex = outputIndex;
    this._signatureScript = signatureScript;
    this._sequence = sequence;
  }

  /**
   * The id of the {@link Transaction} containing the output that this input spends
   */
  get transactionId(): TransactionId { return this._transactionId; }

  /**
   * The index of the output that this input spends
   */
  get outputIndex(): number { return this._outputIndex; }

  /**
   * The signature script (aka `scriptSig`) for this input
   */
  get signatureScript(): Script { return this._signatureScript; }

  /**
   * The input {@link https://bitcoin.org/en/glossary/sequence-number sequence number}
   */
  get sequence(): number { return this._sequence; }

  /**
   * Returns true if this input is the {@link https://bitcoin.org/en/glossary/coinbase-transaction coinbase} input
   */
  get isCoinbase(): boolean { return this._outputIndex === 0xFFFFFFFF; }
}
