// @flow
import OpCode from './OpCode';

import OP_CHECKSIG from './opCodes/OP_CHECKSIG';
import OP_DUP from './opCodes/OP_DUP';
import OP_EQUALVERIFY from './opCodes/OP_EQUALVERIFY';
import OP_HASH160 from './opCodes/OP_HASH160';

const codes = {
  OP_CHECKSIG,
  OP_DUP,
  OP_EQUALVERIFY,
  OP_HASH160,
}

export default codes;
