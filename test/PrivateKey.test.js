const PrivateKey = require('../lib/PrivateKey').default;

describe('PrivateKey', () => {
  describe('256 bit hex string (32 bytes)', () => {
    let keyString = '1184CD2CDD640CA42CFC3A091C51D549B2F016D454B2774019C2B2D2E08529FD';
    let wifString = '5Hx15HFGyep2CfPxsJKe2fXJsCVn5DEiyoeGGF6JZjGbTRnqfiD';
    let privateKey;
    test('#constructor', () => {
      privateKey = PrivateKey.fromHexString(keyString);
      expect(privateKey).toBeDefined();
    });
    test('#toHexString', () => {
      const returnedString = privateKey.toHexString();
      expect(returnedString).toEqual(keyString);
    });
    test('#toWif', () => {
      const returnedString = privateKey.toWif();
      expect(returnedString).toEqual(wifString);
    });
  });
});