/* eslint-disable unicorn/prevent-abbreviations -- `Env` must match the generated Cloudflare.Env interface name to merge. */
// Augments the Wrangler-generated Cloudflare.Env (worker-configuration.d.ts)
// with secrets that live only in .dev.vars / `wrangler secret put`, so they
// survive `wrangler types` regeneration without being dropped.
//
// No top-level import/export: this stays an ambient (global) script so the
// `declare namespace Cloudflare` below merges with the generated global one.
declare namespace Cloudflare {
  interface Env {
    /** HMAC secret for signing/verifying /og card URLs. */
    OG_SIGNATURE: string;
  }
}
