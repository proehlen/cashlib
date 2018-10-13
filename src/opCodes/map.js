// @flow
import OpCode from '../OpCode';
import opCodes from '.';

const mapValues = Object
  .values(opCodes)
  .filter(code => code instanceof OpCode)
  // $flow-disable-line Definetly only getting OpCode type from above, not mixed
  .map((code: OpCode) => [code.value, code]);

const opCodesMap: Map<number, OpCode> = new Map(mapValues);

export default opCodesMap;
