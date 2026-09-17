import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseQuery";
import { API_BASE_URL } from "@/constants/endpoints";

// Utility to strip the "/api/v1" suffix to get the raw backend domain
const BACKEND_ROOT_URL = API_BASE_URL.replace("/api/v1", "");

export const publicApiSlice = createApi({
  reducerPath: "publicApi",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    // Health Check Query
    getHealthCheck: builder.query<any, void>({
      query: () => ({
        // Because this is an absolute URL starting with http://,
        // RTK Query will ignore the 'API_BASE_URL' entirely.
        // url: `${BACKEND_ROOT_URL}/`,
        url: "http://localhost:5000/api/v1",
        method: "GET",
      }),
    }),
  }),
});

export const { useGetHealthCheckQuery } = publicApiSlice;
