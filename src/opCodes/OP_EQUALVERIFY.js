// @flow
import OpCode from '../OpCode';

const OP_EQUALVERIFY = new OpCode(
  0x88,
  'OP_EQUALVERIFY',
  () => { throw new Error('OpCode not yet implemented.'); },
);

export default OP_EQUALVERIFY;
