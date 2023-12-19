/*
 * Simple functions for FALCON signatures
 *
 * @author   Athanasios Vasileios Grammatopoulos <gramthanos@gmail.com>
 */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>

/*
 * This code uses only the external API.
 */

#include "falcon.h"
#include "utils.h"


int falconjs_init () {
	return 0;
}

// bits = 2 ^ logn
// 		= 2 ^ 8 = 256
// 		= 2 ^ 9 = 512
// 		= 2 ^ 10 = 1024

size_t falconjs_pubkey_size (unsigned logn) {
	return FALCON_PUBKEY_SIZE(logn);
}

size_t falconjs_privkey_size (unsigned logn) {
	return FALCON_PRIVKEY_SIZE(logn);
}

size_t falconjs_expandedkey_size (unsigned logn) {
	return FALCON_EXPANDEDKEY_SIZE(logn);
}

size_t falconjs_sig_compressed_maxsize (unsigned logn) {
	return FALCON_SIG_COMPRESSED_MAXSIZE(logn);
}

size_t falconjs_sig_ct_size (unsigned logn) {
	return FALCON_SIG_COMPRESSED_MAXSIZE(logn);
}
int falconjs_make_public(uint8_t *pk, const uint8_t *sk, unsigned logn) {

	size_t tmp_len = FALCON_TMPSIZE_KEYGEN(logn);
	uint8_t *tmp = xmalloc(tmp_len);

	int r = falcon_make_public(
		pk, FALCON_PUBKEY_SIZE(logn),
		sk, FALCON_PRIVKEY_SIZE(logn),
		tmp, tmp_len
	);
	xfree(tmp);
	return r;
}

int falconjs_keygen_make(uint8_t *pk, uint8_t *sk, unsigned logn, const void *seed, size_t seed_len) {

	size_t tmp_len = FALCON_TMPSIZE_KEYGEN(logn);
	uint8_t *tmp = xmalloc(tmp_len);

	shake256_context rng;
	shake256_init_prng_from_seed(&rng, seed, seed_len);

	int r = falcon_keygen_make(&rng, logn,
		sk, FALCON_PRIVKEY_SIZE(logn),
		pk, FALCON_PUBKEY_SIZE(logn),
		tmp, tmp_len
	);

	xfree(tmp);

	return r;
}

int falconjs_expand_privkey(uint8_t *esk, uint8_t *sk, unsigned logn) {

	size_t tmp_len = FALCON_TMPSIZE_EXPANDPRIV(logn);
	uint8_t *tmp = xmalloc(tmp_len);

	int r = falcon_expand_privkey(
		esk, FALCON_EXPANDEDKEY_SIZE(logn),
		sk, FALCON_PRIVKEY_SIZE(logn),
		tmp, tmp_len
	);

	xfree(tmp);

	return r;
}

int falconjs_sign_dyn(uint8_t *sig, size_t *sig_len, uint8_t *sk, uint8_t *data, size_t data_len, unsigned logn, const void *seed, size_t seed_len) {

	size_t tmp_len = FALCON_TMPSIZE_SIGNDYN(logn);
	uint8_t *tmp = xmalloc(tmp_len);

	shake256_context rng;
	shake256_init_prng_from_seed(&rng, seed, seed_len);

	int r = falcon_sign_dyn(
		&rng,
		sig, sig_len, FALCON_SIG_DETERMINISTIC,
		sk, FALCON_PRIVKEY_SIZE(logn),
		data, data_len, tmp, tmp_len
	);

	xfree(tmp);

	return r;
}

int falconjs_verify(uint8_t *sig, size_t sig_len, uint8_t *pk, uint8_t *data, size_t data_len, unsigned logn) {

	size_t tmp_len = FALCON_TMPSIZE_VERIFY(logn);
	uint8_t *tmp = xmalloc(tmp_len);

	int r = falcon_verify(
		sig, sig_len, FALCON_SIG_DETERMINISTIC,
		pk, FALCON_PUBKEY_SIZE(logn),
		data, data_len, tmp, tmp_len
	);

	xfree(tmp);

	return r;
}