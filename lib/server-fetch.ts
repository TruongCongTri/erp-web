import { cookies } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

export async function serverFetch(endpoint: string, options: RequestInit = {}) {
  // Read the cookie directly from the Next.js incoming request
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    // Note: In a real app, handle 401 here by redirecting to login
    throw new Error(`Server fetch failed: ${res.status}`);
  }

  return res.json();
}


/**
 * * IMPLEMENTATION GUIDE
 * 
 * 
 * */ 