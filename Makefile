# Build script for the Falconjs
# based on official Falcon implementation submitted on NIST competition
#
# Build script is based on https://github.com/GramThanos/falcon.js
# @author   Athanasios Vasileios Grammatopoulos <gramthanos@gmail.com>
#
# Difference compared to GramThanos:
# 1. We compile to both webassembly and javascript
# 2. We expose one extra function: "_falconjs_make_public"
#

.POSIX:

# =====================================================================
#
# Configurable options:
#   CC       C compiler to JavaScript; Probably Emscripten ("emcc")
#   CFLAGS   Compilation flags
#   LD       Linker; normally the same command as the compiler.
#   LDFLAGS  Linker options, not counting the extra libs.
#   LIBS     Extra libraries for linking.

CC = emcc
CFLAGS = -Wall -Wextra -Wshadow -Wundef -O3
LD = emcc
LDFLAGS_JS = -s MODULARIZE=1 -s SINGLE_FILE=1 -sWASM=0 -sFILESYSTEM=0 -O1
LDFLAGS_WASM = -s MODULARIZE=1 -s SINGLE_FILE=1 -sFILESYSTEM=0 -O3
LIBS = 

# =====================================================================

SOURCE = ./src/falcon-source/falcon-c-source
WRAPPER_FOLDER = ./src/falcon-source/falcon-c-wrapper
OUTPUT_JS = ./src/compiled-output/falcon-js-impl
OUTPUT_WASM = ./src/compiled-output/falcon-wasm-impl

OBJ = $(SOURCE)/codec.o $(SOURCE)/common.o $(SOURCE)/falcon.o $(SOURCE)/fft.o $(SOURCE)/fpr.o $(SOURCE)/keygen.o $(SOURCE)/rng.o $(SOURCE)/shake.o $(SOURCE)/sign.o $(SOURCE)/utils.o $(SOURCE)/vrfy.o

EXPORT_FUNCTIONS = '["_xmalloc", "_free", "_falconjs_init","_falconjs_pubkey_size","_falconjs_privkey_size","_falconjs_expandedkey_size","_falconjs_sig_compressed_maxsize","_falconjs_sig_ct_size","_falconjs_keygen_make","_falconjs_expand_privkey","_falconjs_sign_dyn","_falconjs_verify","_falconjs_make_public"]'
EXPORT_RUNTIME_METHODS = '["writeArrayToMemory"]'

# =====================================================================

all: falconjs falconwasm

clean:
	-rm -f $(OBJ) $(OUTPUT_JS)/falcon.js $(WRAPPER_FOLDER)/falconjs.o $(OUTPUT_WASM)/falcon.js

falconjs: falconjs.o $(OBJ)
	$(LD) $(LDFLAGS_JS) -o $(OUTPUT_JS)/falcon.js $(WRAPPER_FOLDER)/falconjs.o $(OBJ) $(LIBS) -s EXPORTED_FUNCTIONS=$(EXPORT_FUNCTIONS) -s EXPORTED_RUNTIME_METHODS=$(EXPORT_RUNTIME_METHODS)

falconwasm: falconjs.o $(OBJ)
	$(LD) $(LDFLAGS_WASM) -o $(OUTPUT_WASM)/falcon.js $(WRAPPER_FOLDER)/falconjs.o $(OBJ) $(LIBS) -s EXPORTED_FUNCTIONS=$(EXPORT_FUNCTIONS) -s EXPORTED_RUNTIME_METHODS=$(EXPORT_RUNTIME_METHODS)

# =====================================================================

falconjs.o: $(WRAPPER_FOLDER)/falconjs.c $(SOURCE)/falcon.h
	$(CC) $(CFLAGS) -c -o $(WRAPPER_FOLDER)/falconjs.o $(WRAPPER_FOLDER)/falconjs.c -I$(SOURCE)/

codec.o: codec.c config.h inner.h fpr.h
	$(CC) $(CFLAGS) -c -o $(SOURCE)/codec.o $(SOURCE)/codec.c

common.o: common.c config.h inner.h fpr.h
	$(CC) $(CFLAGS) -c -o $(SOURCE)/common.o $(SOURCE)/common.c

falcon.o: falcon.c falcon.h config.h inner.h fpr.h
	$(CC) $(CFLAGS) -c -o $(SOURCE)/falcon.o $(SOURCE)/falcon.c

fft.o: fft.c config.h inner.h fpr.h
	$(CC) $(CFLAGS) -c -o $(SOURCE)/fft.o $(SOURCE)/fft.c

fpr.o: fpr.c config.h inner.h fpr.h
	$(CC) $(CFLAGS) -c -o $(SOURCE)/fpr.o $(SOURCE)/fpr.c

keygen.o: keygen.c config.h inner.h fpr.h
	$(CC) $(CFLAGS) -c -o $(SOURCE)/keygen.o $(SOURCE)/keygen.c

rng.o: rng.c config.h inner.h fpr.h
	$(CC) $(CFLAGS) -c -o $(SOURCE)/rng.o $(SOURCE)/rng.c -D FALCON_RAND_GETENTROPY=0 -D FALCON_RAND_URANDOM=1 -D FALCON_RAND_WIN32=0

shake.o: shake.c config.h inner.h fpr.h
	$(CC) $(CFLAGS) -c -o $(SOURCE)/shake.o $(SOURCE)/shake.c

sign.o: sign.c config.h inner.h fpr.h
	$(CC) $(CFLAGS) -c -o $(SOURCE)/sign.o $(SOURCE)/sign.c

utils.o: utils.c utils.h
	$(CC) $(CFLAGS) -c -o $(SOURCE)/utils.o $(SOURCE)/utils.c

vrfy.o: vrfy.c config.h inner.h fpr.h
	$(CC) $(CFLAGS) -c -o $(SOURCE)/vrfy.o $(SOURCE)/vrfy.c
