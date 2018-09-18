// @flow

export function stringLeftPad(str: string, length: number = 2, padChar: string = '0') {
  let result = str;
  const padLength = length - str.length;
  for (let i = 0; i < padLength; ++i) {
    result = `${padChar}${result}`;
  }
  return result;
}

/**
 * Takes a hex string and returns Uint8Array of bytes
 * @param {string} str 
 */
export function stringToBytes(str: string): Uint8Array {
  if (str.length % 2) {
    throw new Error('String to bytes conversion requires even length string');
  }
  const bytes = new Uint8Array(str.length / 2);
  for (let sourcePos = 0, targetIndex = 0; sourcePos < str.length; sourcePos += 2, ++targetIndex) {
    const byteString = str.substr(sourcePos, 2);
    const byte = parseInt(byteString, 16);
    bytes[targetIndex] = byte;
  }
  return bytes;
}

export function stringFromBytes(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(byte => stringLeftPad(byte.toString(16), 2))
    .join('');
}

export function stringReverseBytes(str: string): string {
  if (str.length % 2) {
    throw new Error('Cannnot reverse bytes in uneven length string');
  }

  let result = '';
  for (let i = str.length; i > 0; i -= 2) {
    const end = i;
    const start = end - 2;
    result += str.substring(start, end);
  }

  return result;
}
