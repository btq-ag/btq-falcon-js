import { getFalconImplWrapper } from './runtime_interface/falcon-impl-wrapper';
import { generateInterface } from './runtime_interface/getLibraryInterface';
import FalconWasmImpl = require('./compiled-output/falcon-wasm-impl/falcon');

const wrappedFalconWasmImpl = getFalconImplWrapper(FalconWasmImpl);

export const { sign, verify, keyPair, getPublicKeyFromPrivateKey } =
  generateInterface(wrappedFalconWasmImpl);

export default {
  sign,
  verify,
  keyPair,
  getPublicKeyFromPrivateKey,
};
