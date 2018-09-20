// @flow
import OpCode from '../OpCode';

const OP_HASH160 = new OpCode(
  0xa9,
  'OP_HASH160',
  () => { throw new Error('OpCode not yet implemented.'); }
);

 export default OP_HASH160;