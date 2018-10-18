// @flow

import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

import Data from './Data';

const wordlistFile = path.join(__dirname, 'MnemonicSeed', 'wordlist');
const wordlist = fs.readFileSync(wordlistFile, { encoding: 'utf8' }).split('\n');

/**
 * This class implements {@link https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki
 * BIP-0039}, using mnemonic sentences to generate binary seeds
 * @todo Implement checksum checking
 * @todo Allow varying length phrase
 */
export default class MnemonicSeed extends Data {
  /**
   * Returns a MnemonicSeed from 12 seed words.
   */
  static fromWords(seedWords: string[]): MnemonicSeed {
    // Validate seedWords provided and correct type/length
    if (!seedWords || !Array.isArray(seedWords) || seedWords.length !== 12) {
      throw new Error('MnemonicSeed requires exactly 12 seed words');
    }

    // Validate each word is in word list
    // eslint-disable-next-line no-restricted-syntax
    for (const word of seedWords) {
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
    return new MnemonicSeed(seedBytes);
  }
}
