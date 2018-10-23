// @flow
import OpCode from '../OpCode';

const OP_EQUAL = new OpCode(
  0x87,
  'OP_EQUAL',
  () => { throw new Error('OpCode not yet implemented.'); },
);

export default OP_EQUAL;
