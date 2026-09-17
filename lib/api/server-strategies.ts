import { serverFetch } from "../server-fetch";
import { unstable_cache } from "next/cache";

// wraps Next.js caching and native fetch. It is strictly for Next.js Server Components.
// Define the exact cache profiles (revalidate window, in seconds)
const CACHE_PROFILES = {
  max: 2592000, // 30 days
  days: 86400, // 1 day
  hours: 3600, // 1 hour
};

type CacheLifeProfile = keyof typeof CACHE_PROFILES;

/**
 * STRATEGY 1: CACHED MASTER DATA (SSG/ISR)
 * Use for data that rarely changes: Roles, Departments, Categories, Unit Types.
 *
 * @param endpoint - The API route (e.g., '/departments')
 * @param tags - Cache tags for targeted on-demand revalidation via Cronjobs
 * @param life - Cache profile ('max', 'days', 'hours')
 */
export async function fetchMasterData<T>(
  endpoint: string,
  tags: string[],
  profileName: CacheLifeProfile = "max"
): Promise<T> {
  const cached = unstable_cache(() => serverFetch(endpoint), [endpoint, ...tags], {
    tags,
    revalidate: CACHE_PROFILES[profileName],
  });

  return cached();
}

/**
 * STRATEGY 2: LIVE SERVER DATA (Partial Prerendering - PPR)
 * Use inside <Suspense> boundaries for dashboards or live metrics.
 * Bypasses cache entirely for real-time freshness on page load.
 * 
 * @param endpoint - The API route (e.g., '/stats/today')
 */
export async function fetchLiveServerData<T>(endpoint: string): Promise<T> {
  return serverFetch(endpoint, { cache: "no-store" });
}