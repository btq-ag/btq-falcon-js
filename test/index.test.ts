import { randomBytes } from 'crypto';
import falconJs from '../src';
import falconWasm from '../src/wasm';

const covertStrToUint8Array = (str: string): Uint8Array =>
  Uint8Array.from(Buffer.from(str));

const seed1 = Buffer.from(
  '0d31faeff106f303fce9000913f6fbef06e50f032909f1e0f',
  'hex'
);
const seed2 = Buffer.from(
  'deeaffe600d4f50af3100bd614180bfb0feaf91ff809d5f61ad5cfec',
  'hex'
);

const FALCON_IMPL: Array<[string, typeof falconJs | typeof falconWasm]> = [
  ['JS', falconJs],
  ['WASM', falconWasm],
];

describe('falconJS unit tests', () => {
  test.each(FALCON_IMPL)(
    '[%s]: Should be able to sign and verify',
    async (str, falcon) => {
      const k = await falcon.keyPair(seed1);
      const sig = await falcon.sign(
        covertStrToUint8Array('asdasdasd'),
        k.privateKey
      );
      const verifyResult = await falcon.verify(
        covertStrToUint8Array('asdasdasd'),
        sig,
        k.publicKey
      );
      expect(verifyResult).toBe(true);
    }
  );

  test.each(FALCON_IMPL)(
    '[%s]: Verify should fail with incorrect signature',
    async (str, falcon) => {
      const message = 'pen pineapple apple pen';

      const key1 = await falcon.keyPair(seed1);
      const key2 = await falcon.keyPair(seed2);

      expect(key1.privateKey).not.toBe(key2.privateKey);

      const sig1 = await falcon.sign(
        covertStrToUint8Array(message),
        key1.privateKey
      );
      const sig2 = await falcon.sign(
        covertStrToUint8Array(message),
        key2.privateKey
      );

      expect(
        falcon.verify(covertStrToUint8Array(message), sig1, key1.publicKey)
      ).resolves.toBe(true);
      expect(
        falcon.verify(covertStrToUint8Array(message), sig2, key1.publicKey)
      ).rejects.toThrowError();
    }
  );

  test.each(FALCON_IMPL)(
    '[%s]: Verify should fail with incorrect public key',
    async (str, falcon) => {
      const message = 'pen pineapple apple pen';

      const key1 = await falcon.keyPair(seed1);
      const key2 = await falcon.keyPair(seed2);

      expect(key1.privateKey).not.toBe(key2.privateKey);

      const sig = await falcon.sign(
        covertStrToUint8Array(message),
        key1.privateKey
      );

      expect(
        falcon.verify(covertStrToUint8Array(message), sig, key1.publicKey)
      ).resolves.toBe(true);
      expect(
        falcon.verify(covertStrToUint8Array(message), sig, key2.publicKey)
      ).rejects.toThrowError();
    }
  );

  test.each(FALCON_IMPL)(
    '[%s] Recover publicKey from privateKey',
    async (str, falcon) => {
      for (let i = 0; i < 10; i++) {
        const randomSeed = randomBytes(32);
        const key = await falcon.keyPair(randomSeed);
        const recoveredPublickey = await falcon.getPublicKeyFromPrivateKey(
          key.privateKey
        );
        expect(Buffer.from(recoveredPublickey).equals(key.publicKey)).toBe(
          true
        );
      }
    }
  );
});
