// @flow

import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

import PrivateKey from './PrivateKey';

const wordlistFile = path.join(__dirname, 'Wallet', 'wordlist');
const wordlist = fs.readFileSync(wordlistFile, { encoding: 'utf8' }).split('\n');

export default class Wallet {
  _seedWords: string[]
  _seed: PrivateKey

  constructor(seedWords: string[]) {
    // Validate seedWords provided and correct type/length
    if (!seedWords || !Array.isArray(seedWords) || seedWords.length !== 12) {
      throw new Error(`Wallet requires exactly 12 seed words`);
    }

    // Validate each word is in word list
    for (let word of seedWords) {
      if (wordlist.indexOf(word) < 0) {
        throw new Error(`'${word}' is not in the word list.`);
      }
    }

    // Generate key
    const seedBytes = crypto.pbkdf2Sync(
      seedWords.join(' '),
      'mnemonic', // TODO add optional passphrase here
      2048,
      64,
      'SHA512',
    );
    this._seed = new PrivateKey(seedBytes);
  }

  get seed() { return this._seed; }

}
