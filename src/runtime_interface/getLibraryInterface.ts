const FALCON_TYPE = 512;

export const generateInterface = (falcon: any) => {
  const getPublicKeyFromPrivateKey = async (
    privateKey: Uint8Array
  ): Promise<Uint8Array> => {
    const publicKey = await falcon.publicKeyFromPrivateKey(
      privateKey,
      FALCON_TYPE
    );
    return publicKey;
  };

  const keyPair = async (
    seed: Buffer
  ): Promise<{
    publicKey: Uint8Array;
    privateKey: Uint8Array;
  }> => {
    return await falcon.keypair(FALCON_TYPE, seed);
  };

  const sign = async (
    message: Uint8Array,
    privateKey: Uint8Array
  ): Promise<Uint8Array> => {
    const signature = await falcon.sign(
      message,
      privateKey,
      FALCON_TYPE,
      Buffer.from('00000000000000000000000000000000', 'hex')
    );

    return signature;
  };

  const verify = async (
    message: Uint8Array,
    signature: Uint8Array,
    publicKey: Uint8Array
  ): Promise<true> => {
    const isValid = await falcon.verify(
      message,
      signature,
      publicKey,
      FALCON_TYPE
    );
    return isValid;
  };

  return {
    getPublicKeyFromPrivateKey,
    keyPair,
    sign,
    verify,
  };
};
