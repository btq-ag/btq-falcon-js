/**
 * The original implementation is from:
 * https://github.com/GramThanos/falcon.js (patch.pre.js and patch.post.js)
 * Instead of concating emcc output with two patch files, we use one wrapper file
 *
 */

// We don't enforce typing for this file
// @ts-nocheck

import * as packageJson from '../../package.json';

let falcon;
let initResolver;
const init = new Promise((res) => (initResolver = res));

// Check if valid return data
function dataReturn(returnValue, result) {
  if (returnValue === 0) return result;
  throw new Error('FALCON error: ' + returnValue);
}

// Get result from memory
function dataResult(buffer, bytes) {
  return new Uint8Array(new Uint8Array(falcon.HEAPU8.buffer, buffer, bytes));
}

// Free malloc buffer
function dataFree(buffer) {
  try {
    falcon._free(buffer);
  } catch (err) {
    setTimeout(() => {
      throw err;
    }, 0);
  }
}

export const getFalconImplWrapper = (FalconImpl) => {
  FalconImpl({
    onRuntimeInitialized() {
      falcon = this;
      falcon._falconjs_pubkey_size();
      falcon._falconjs_init();
      initResolver();
    },
  });

  return {
    version: `${packageJson.name}-${packageJson.version}`,

    publicKeyFromPrivateKey: function (privateKey: Uint8Array, n: number) {
      return init.then(function () {
        const logn = Math.log2(n);
        var privateKeyBytes = privateKey.length;
        var privateKeyBuffer = falcon._xmalloc(privateKeyBytes);
        var publicKeyBytes = falcon._falconjs_pubkey_size(logn);
        var publicKeyBuffer = falcon._xmalloc(publicKeyBytes);

        falcon.writeArrayToMemory(privateKey, privateKeyBuffer);

        try {
          const returnValue = falcon._falconjs_make_public(
            publicKeyBuffer,
            privateKeyBuffer,
            logn
          );

          return dataReturn(
            returnValue,
            dataResult(publicKeyBuffer, publicKeyBytes)
          );
        } finally {
          dataFree(publicKeyBuffer);
          dataFree(privateKeyBuffer);
        }
      });
    },

    keypair: function (
      n: number,
      seed: Uint8Array
    ): Promise<{
      publicKey: Uint8Array;
      privateKey: Uint8Array;
    }> {
      return init.then(function () {
        var logn = Math.log2(n);
        var publicKeyBytes = falcon._falconjs_pubkey_size(logn);
        var publicKeyBuffer = falcon._xmalloc(publicKeyBytes);
        var privateKeyBytes = falcon._falconjs_privkey_size(logn);
        var privateKeyBuffer = falcon._xmalloc(privateKeyBytes);

        var seedBytes = seed.length;
        var seedBuffer = falcon._xmalloc(seedBytes);
        falcon.writeArrayToMemory(seed, seedBuffer);

        try {
          var returnValue = falcon._falconjs_keygen_make(
            publicKeyBuffer,
            privateKeyBuffer,
            logn,
            seedBuffer,
            seedBytes
          );

          return dataReturn(returnValue, {
            publicKey: dataResult(publicKeyBuffer, publicKeyBytes),
            privateKey: dataResult(privateKeyBuffer, privateKeyBytes),
          });
        } finally {
          dataFree(publicKeyBuffer);
          dataFree(privateKeyBuffer);
          dataFree(seedBuffer);
        }
      });
    },

    sign: function (
      message: Uint8Array,
      privateKey: Uint8Array,
      n: number,
      seed: Uint8Array
    ): Promise<Uint8Array> {
      return init.then(function () {
        var logn = Math.log2(n);

        var data =
          typeof message === 'string'
            ? new TextEncoder().encode(message)
            : message;
        var dataBytes = data.length;
        var dataBuffer = falcon._xmalloc(dataBytes);
        var privateKeyBytes = privateKey.length;
        var privateKeyBuffer = falcon._xmalloc(privateKeyBytes);
        var signatureKeyBytes = falcon._falconjs_sig_compressed_maxsize(logn);
        var signatureKeyBuffer = falcon._xmalloc(signatureKeyBytes);
        var signatureKeyBytesByffer = falcon._xmalloc(4);

        falcon.writeArrayToMemory(data, dataBuffer);
        falcon.writeArrayToMemory(privateKey, privateKeyBuffer);
        falcon.writeArrayToMemory(
          new Uint8Array(new Int32Array([signatureKeyBytes]).buffer),
          signatureKeyBytesByffer
        );

        var seedBytes = seed.length;
        var seedBuffer = falcon._xmalloc(seedBytes);
        falcon.writeArrayToMemory(seed, seedBuffer);

        try {
          var returnValue = falcon._falconjs_sign_dyn(
            signatureKeyBuffer,
            signatureKeyBytesByffer,
            privateKeyBuffer,
            dataBuffer,
            dataBytes,
            logn,
            seedBuffer,
            seedBytes
          );

          signatureKeyBytes = new Int32Array(
            dataResult(signatureKeyBytesByffer, 4).buffer
          )[0];

          return dataReturn(
            returnValue,
            dataResult(signatureKeyBuffer, signatureKeyBytes)
          );
        } finally {
          dataFree(dataBuffer);
          dataFree(privateKeyBuffer);
          dataFree(signatureKeyBuffer);
          dataFree(seedBuffer);
        }
      });
    },

    verify: function (
      message: Uint8Array,
      signature: Uint8Array,
      publicKey: Uint8Array,
      n: number
    ): Promise<boolean> {
      return init.then(function () {
        var logn = Math.log2(n);

        var data =
          typeof message === 'string'
            ? new TextEncoder().encode(message)
            : message;
        var dataBytes = data.length;
        var dataBuffer = falcon._xmalloc(dataBytes);
        var publicKeyBytes = publicKey.length;
        var publicKeyBuffer = falcon._xmalloc(publicKeyBytes);
        var signatureKeyBytes = signature.length;
        var signatureKeyBuffer = falcon._xmalloc(signatureKeyBytes);

        falcon.writeArrayToMemory(data, dataBuffer);
        falcon.writeArrayToMemory(publicKey, publicKeyBuffer);
        falcon.writeArrayToMemory(signature, signatureKeyBuffer);

        try {
          var returnValue = falcon._falconjs_verify(
            signatureKeyBuffer,
            signatureKeyBytes,
            publicKeyBuffer,
            dataBuffer,
            dataBytes,
            logn
          );

          return dataReturn(returnValue, returnValue === 0);
        } finally {
          dataFree(dataBuffer);
          dataFree(publicKeyBuffer);
          dataFree(signatureKeyBuffer);
        }
      });
    },
  };
};
