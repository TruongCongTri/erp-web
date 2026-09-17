import { Role } from "@/components/role/roleData";
import { fetchMasterData, fetchLiveServerData } from "./server-strategies";

// Types
import type { TodayStats } from "@/types/apiver2";
import { AuthUser, Department, UpcomingEvent } from "@/types/modelsver2";
import { cookies } from "next/headers";
import { API_BASE_URL, API_ENDPOINTS } from "@/constants/endpoints";

// Generic server fetch wrapper
async function serverFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  
  // 1. Get the cookies from the incoming Next.js request
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  // 2. Prepare the headers
  const headers = new Headers(options?.headers);
  headers.set("Content-Type", "application/json");
  
  // 3. IF we have a token, attach it to the backend request!
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  // 4. Execute the fetch request to the NestJS Backend
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    // Ensure Next.js caches this properly based on your setup
    // cache: "no-store", // Use this if you are NOT using the "use cache" directive
  });

  if (!res.ok) {
    // Throw an error so the try/catch in DashboardLayout catches it
    throw new Error(`Server fetch failed with status: ${res.status}`);
  }

  const json = await res.json();
  
  // Return the nested "data" property based on your API response structure
  return json.data;
}

export const ServerAPI = {
  // Master Data
  getDepartments: () =>
    fetchMasterData<Department[]>(
      "/departments",
      ["departments-master"],
      "max",
    ),

  getRoles: () => fetchMasterData<Role[]>("/roles", ["roles-master"], "max"),

  // Dashboards
  getTodayStats: () => fetchLiveServerData<TodayStats>("/hr/stats/today"),

  getUpcomingEvents: () =>
    fetchMasterData<UpcomingEvent[]>(
      "/hr/events/upcoming",
      ["events-master"],
      "days",
    ),

  getMe: () => serverFetch<AuthUser>(API_ENDPOINTS.USERS.ME),
};
