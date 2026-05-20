import { createClient, type SanityClient } from "@sanity/client";

export const SANITY_API_VERSION = "2025-01-01";

interface ClientOptions {
  env: Env;
}

export function getSanityClient({ env }: ClientOptions): SanityClient {
  return createClient({
    projectId: env.SANITY_PROJECT_ID,
    dataset: env.SANITY_DATASET,
    apiVersion: SANITY_API_VERSION,
    useCdn: true,
    perspective: "published",
    token: env.SANITY_API_READ_TOKEN,
  });
}
