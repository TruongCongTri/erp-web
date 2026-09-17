// helper functions for Redux Toolkit (RTK) Query. It abstracts away the complex boilerplate needed for Tables, Polling, and CRUD operations.
import type { ERPTagType } from "./tags";

/**
 * STRATEGY 3: DATA TABLE QUERY (Standard CSR)
 * Caches data based on parameters (page, limit, filters).
 * Automatically re-fetches if an associated mutation invalidates its tag.
 *
 * @param url - The API route
 * @param tags - The Redux tag to listen to for invalidation
 */
export const tableQueryStrategy = <Params = Record<string, unknown>>(
  url: string,
  tags: ERPTagType[],
): {
  query: (params: Params) => { url: string; params: Params };
  providesTags: ERPTagType[];
} => ({
  query: (params: Params) => ({ url, params }),
  providesTags: tags,
});

/**
 * STRATEGY 4: POLLING DASHBOARD QUERY (Live without WebSockets)
 * Use for HR metrics (attendance, pending requests).
 * Silently re-fetches in the background at a set interval.
 *
 * @param url - The API route
 * @param intervalMs - Polling time in milliseconds (e.g., 300000 = 5 mins)
 */
export const pollingQueryStrategy = (
  url: string,
  intervalMs: number,
): {
  query: () => { url: string };
  pollingConfig: {
    pollingInterval: number;
    skipPollingIfUnfocused: boolean;
  };
} => ({
  query: () => ({ url }),
  // These config options must be applied at the component level, but
  // defining them here ensures consistency across the ERP.
  pollingConfig: {
    pollingInterval: intervalMs,
    skipPollingIfUnfocused: true, // Don't drain server if user changes tabs
  },
});

/**
 * STRATEGY 5: CRUD MUTATION (Create/Update/Soft Delete)
 * Executes a mutation and automatically invalidates the table cache,
 * causing the Data Table to instantly refresh without page reloads.
 *
 * @param buildUrl - Function to construct URL (e.g., (id) => `/users/${id}`)
 * @param method - HTTP Method ('POST', 'PATCH', 'DELETE')
 * @param tags - The Redux tag to destroy, triggering a refetch
 */
export const crudMutationStrategy = <Req = unknown>(
  buildUrl: (arg: Req) => string,
  method: "POST" | "PATCH" | "PUT" | "DELETE",
  tags: ERPTagType[],
): {
  query: (arg: Req) => { url: string; method: string; body?: Req };
  invalidatesTags: ERPTagType[];
} => ({
  query: (arg: Req) => ({
    url: buildUrl(arg),
    method,
    // TypeScript now strictly understands body is either the Request type or undefined
    body: method !== "DELETE" ? arg : undefined,
  }),
  invalidatesTags: tags,
});

/**
 * STRATEGY 6: INFINITE SCROLL (Company Newsfeed)
 * Appends new data to the bottom of the list instead of replacing it.
 *
 * @param url - The API route
 */
export const infiniteScrollStrategy = <T>(url: string) => ({
  query: (page: number) => ({ url, params: { page, limit: 10 } }),
  // Keep the same cache key regardless of page number
  serializeQueryArgs: ({ endpointName }: { endpointName: string }) =>
    endpointName,
  // Merge new incoming data with existing cached data
  merge: (currentCache: T[], newItems: T[]) => {
    currentCache.push(...newItems);
  },
  // Always fetch when page number changes
  forceRefetch: ({
    currentArg,
    previousArg,
  }: {
    currentArg: number | undefined;
    previousArg: number | undefined;
  }) => currentArg !== previousArg,
});
