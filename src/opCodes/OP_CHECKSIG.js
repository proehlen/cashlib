// @flow
import OpCode from '../OpCode';

const OP_CHECKSIG = new OpCode(
  0xac,
  'OP_CHECKSIG',
  () => { throw new Error('OpCode not yet implemented.'); },
);

export default OP_CHECKSIG;
