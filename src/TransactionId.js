// @flow

import Data, { type DataFrom } from './Data';

export default class TransactionId extends Data {
  constructor(bytes: DataFrom) {
    super(bytes);
    if (this.length !== 32) {
      throw new Error('Expected transaction id to be 32 bytes long.')
    }
  }
}
