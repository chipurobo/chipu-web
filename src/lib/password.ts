// =============================================================
// Temporary-password generation for admin-provisioned school accounts.
//
// These are real login credentials, so they must come from a CSPRNG.
// The previous implementation used Math.random(), which in V8 is an
// xorshift128+ PRNG whose internal state can be recovered from a short
// run of outputs — and a bulk import draws every school's password from
// one such run, so recovering the state from one or two distributed
// passwords yields all the others.
//
// Alphabet excludes i/l/o/0/1 so the passwords survive being read off a
// screen, written down, and typed by a teacher.
// =============================================================

const ALPHABET = 'abcdefghjkmnpqrstuvwxyz23456789';
const GROUP_LEN = 6;
const GROUPS = 2;

/**
 * Uniformly samples `count` characters from ALPHABET using crypto.
 *
 * Rejection sampling: 256 is not a multiple of the alphabet length, so
 * bytes in the final partial bucket are discarded rather than folded in
 * with `%`, which would bias the low characters.
 */
function randomChars(count: number): string {
  const limit = 256 - (256 % ALPHABET.length); // largest unbiased byte + 1
  const out: string[] = [];

  while (out.length < count) {
    const bytes = new Uint8Array(count - out.length);
    crypto.getRandomValues(bytes);
    for (const byte of bytes) {
      if (byte < limit) out.push(ALPHABET[byte % ALPHABET.length]);
    }
  }

  return out.join('');
}

/** e.g. "kpx4mq-7bhtzn" — two hyphen-separated groups of six. */
export function generatePassword(): string {
  return Array.from({ length: GROUPS }, () => randomChars(GROUP_LEN)).join('-');
}
