// @flow

declare var describe: any;
declare var test: any;
declare var expect: any;

const fs = require('fs');
const path = require('path');
const BigInt = require('big-integer');
const modSqrt = require('../lib/math').modSqrt;


const pythonResultsFile = path.join(__dirname, 'math', 'modSqrtPythonResults.json');
const pythonResults = JSON.parse(fs.readFileSync(pythonResultsFile, 'utf8'));

describe('math', () => {
  describe('modSqrt', () => {
    describe('test against python results', () => {
      // eslint-disable-next-line no-restricted-syntax
      for (const pyResult of pythonResults) {
        test(`modSqrt(${pyResult.a}, ${pyResult.p}) === ${pyResult.x})`, () => {
          const a = new BigInt(pyResult.a);
          const p = new BigInt(pyResult.p);
          const ourResult = modSqrt(a, p);
          expect(ourResult.toJSNumber()).toEqual(pyResult.x);
        });
      }
    });
  });
});
