# btq-falcon-js

BTQ's customized javascript implementation of FALCON

## What's FALCON?

FALCON (Fast-Fourier Lattice-based Compact Signatures over NTRU) stands at the forefront of cryptographic innovation. It's a state-of-the-art post-quantum signature scheme, which has gained recognition and endorsement by the National Institute of Standards and Technology (NIST) in their fourth round of the post-quantum standardization process. FALCON is designed to withstand the potential cryptographic challenges posed by quantum computing, making it a critical tool for safeguarding digital security in the future. To delve deeper into FALCON's intricacies and its role in the cryptographic landscape, visit their [official website](https://falcon-sign.info/).

In our version of FALCON, we've gone a step further. While adhering to the core principles of the original FALCON implementation, we've introduced modifications that enhance the deterministic nature of the algorithm's output. This crucial improvement aligns perfectly with our aggregate signature solution, [PQScale](https://www.btq.com/blog/introducing-pqscale-a-scaling-solution-for-post-quantum-signatures), elevating its efficiency and reliability without compromising the fundamental aspect of security.

## About this repo

This repository is a comprehensive package for compiling the C implementation of FALCON into JavaScript and WebAssembly. Drawing inspiration and building upon the remarkable work of Grammatopoulos Athanasios-Vasileios ([see his implementation](https://github.com/GramThanos/falcon.js)), our version contains these unique features:

1. Integration of BTQ's specialized version of the FALCON algorithm.
2. Inclusion of an additional method in the JavaScript interface, enabling the conversion of a secret key to a public key

### Local Setup and Testing

To get started, please follow these steps:

```sh
npm install
npm run test
```

This will install all necessary dependencies and run a series of unit tests to verify the integrity and functionality of the implementation.

### Examples

For a hands-on introduction to using btq-falcon-js, the `test/index.test.ts`` file is your go-to resource. This file not only serves as a test suite but also acts as a practical guide, demonstrating the usage of the compiled output in various scenarios.

## NPM installation

The btq-falcon-js library is readily available for installation through NPM. Choose between the JavaScript or WebAssembly version based on your requirements:

For JavaScript implementation:

```sh
npm install @btq-js/falcon-js
```

For WebAssembly version:

```sh
npm install @btq-js/falcon-wasm
```

## Compile from source

For those interested in compiling the original C implementation into JavaScript/WebAssembly, the following instructions will guide you through the process. Ensure you have Emscripten installed on your system:

```sh
make clean
make
```

\_\_

### Appreciation and Legal Note

btq-falcon-js is distributed under the permissive [MIT license](https://opensource.org/licenses/MIT).

This project owes its existence and evolution to:

1. Original [Falcon](https://falcon-sign.info/) implementation
2. [Emscripten compiler setup](https://github.com/GramThanos/falcon.js) by Grammatopoulos Athanasios-Vasileios

---
