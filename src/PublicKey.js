// @flow
// import PrivateKey from './PrivateKey';

// export default class PublicKey {
//   _key: Uint8Array;

//   constructor(key: Uint8Array) {
//     this._key = key;
//   }

//   static fromPrivatekey(privateKey: PrivateKey) {
//     const argType = 'string';
//     const argLength = 64;

//     const arrayLen = argLength / 2;
//     let key = new Uint8Array(arrayLen);
//     // for (let i: number = 0; i < hexString.length; i += 2) {
//     //   const byteString = hexString.substr(i, 2);
//     //   const byte = parseInt(byteString, 16);
//     //   key[i] = byte;
//     // }
      
//     return new PublicKey(key);
//   }
// }