// @flow
import OpCode from '../OpCode';

const OP_DUP = new OpCode(
  0x76,
  'OP_DUP',
  () => { throw new Error('OpCode not yet implemented.'); }
);

export default OP_DUP;