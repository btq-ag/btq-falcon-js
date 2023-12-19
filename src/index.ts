import { getFalconImplWrapper } from './runtime_interface/falcon-impl-wrapper';
import { generateInterface } from './runtime_interface/getLibraryInterface';
import FalconJsImpl = require('./compiled-output/falcon-js-impl/falcon');

export const { sign, verify, keyPair, getPublicKeyFromPrivateKey } =
  generateInterface(getFalconImplWrapper(FalconJsImpl));

export default {
  sign,
  verify,
  keyPair,
  getPublicKeyFromPrivateKey,
};
