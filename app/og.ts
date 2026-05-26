import { SITE } from "./seo";

/**
 * Signed Open Graph card URLs.
 *
 * The `/og/card.png` endpoint rasterizes an arbitrary title into a branded PNG.
 * To stop third parties from rendering arbitrary text (and abusing the
 * rasterizer), every URL carries an HMAC-SHA256 signature over the normalized
 * title. Signing happens server-side only (in loaders); the secret never
 * reaches the client. Verification uses `crypto.subtle.verify` for a
 * constant-time comparison.
 *
 * Uses Web Crypto, which is available both on Cloudflare Workers and in Node.
 */

const encoder = new TextEncoder();

/** Normalize a title so signing and verifying agree on the exact bytes. */
export function normalizeTitle(title: string): string {
  return title.replaceAll(/\s+/g, " ").trim().slice(0, 200);
}

function base64UrlEncode(bytes: ArrayBuffer): string {
  let binary = "";
  const view = new Uint8Array(bytes);
  for (const byte of view) binary += String.fromCodePoint(byte);
  return btoa(binary)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

function base64UrlDecode(value: string): Uint8Array {
  const padded = value.replaceAll("-", "+").replaceAll("_", "/");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.codePointAt(index) ?? 0;
  }
  return bytes;
}

async function importKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

/** HMAC-SHA256 signature (base64url) of a normalized title. */
export async function signTitle(
  title: string,
  secret: string,
): Promise<string> {
  const key = await importKey(secret);
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(normalizeTitle(title)),
  );
  return base64UrlEncode(signature);
}

/** Constant-time verification of a title's signature. */
export async function verifyTitle(
  title: string,
  signature: string,
  secret: string,
): Promise<boolean> {
  try {
    const key = await importKey(secret);
    return await crypto.subtle.verify(
      "HMAC",
      key,
      base64UrlDecode(signature),
      encoder.encode(normalizeTitle(title)),
    );
  } catch {
    return false;
  }
}

/** Absolute, signed `/og/card.png` URL for a title. Call from a loader. */
export async function buildSignedOgImageUrl(
  title: string,
  secret: string,
): Promise<string> {
  const normalized = normalizeTitle(title);
  const sig = await signTitle(normalized, secret);
  const parameters = new URLSearchParams({ title: normalized, sig });
  return `${SITE.url}/og/card.png?${parameters.toString()}`;
}
