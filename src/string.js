// @flow

export function leftPad(str: string, length: number = 2, padChar: string = '0') {
  let result = str;
  const padLength = length - str.length;
  for (let i = 0; i < padLength; ++i) {
    result = `${padChar}${result}`;
  }
  return result;
}

export function reverseBytes(str: string) {
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
