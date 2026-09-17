
# 📖 ERP API & Data Fetching Guide

This project uses a hybrid data-fetching architecture designed to maximize performance and protect backend database connections.

We strictly divide our data fetching into two environments: **Server Components** (using Next.js 16 `"use cache"`) and **Client Components** (using Redux Toolkit Query).

This guide explains how to use both correctly in your UI components.

---

## 1. Server Components (Next.js 16 Caching)

**When to use:** For pages loading Master Data (departments, roles, unit types) or dashboard shells.
**Where it comes from:** `import { ServerAPI } from "@/lib/api/server-api";`

Server components run on the server before the HTML is sent to the browser. We use **Partial Prerendering (PPR)** to serve static data instantly while wrapping live, dynamic data in a `<Suspense>` boundary.

### Example: Dashboard with PPR

```tsx
import { ServerAPI } from "@/lib/api/server-api";
import { Suspense } from "react";

export default async function HRDashboard() {
  // 1. STATIC/MASTER DATA: Uses 'use cache' behind the scenes. 
  // Loads instantly from Next.js server memory. Zero database hits.
  const events = await ServerAPI.getUpcomingEvents(); 

  return (
    <div>
      <EventsList events={events} />
      
      {/* 2. DYNAMIC DATA: Suspense boundary triggers Partial Prerendering */}
      <Suspense fallback={<Spinner label="Loading live stats..." />}>
         <LiveStatsLoader />
      </Suspense>
    </div>
  );
}

// This component bypasses the Next.js cache and fetches fresh data on every request
async function LiveStatsLoader() {
  const stats = await ServerAPI.getTodayStats();
  return <StatsCard data={stats} />;
}

```

---

## 2. Client Components (RTK Query)

**When to use:** For heavy data grids, CRUD operations (Create/Update/Delete), infinite scrolling, and live data polling.
**Where it comes from:** `import { use...Query, use...Mutation } from "@/lib/store/erpApiSlice";`

Client components run in the browser. Our RTK Query setup handles all pagination caching, token refreshing, and automatic UI updates so you don't have to manually manage React state.

### Example A: Data Tables & Auto-Refreshing Mutations

When building a data table, **never manually call `refresh()` or `refetch()` after a deletion or update.** Our architecture uses strict Tag Invalidation (`ERP_TAGS`). When a mutation succeeds, Redux automatically invalidates the table's cache tag and fetches the updated list.

```tsx
"use client";

import { 
  useGetEmployeesTableQuery, 
  useSoftDeleteEmployeeMutation 
} from "@/lib/store/erpApiSlice";

export function EmployeeGrid({ page, limit }) {
  // 1. THE QUERY: Automatically caches based on { page, limit } arguments
  const { data, isLoading } = useGetEmployeesTableQuery({ page, limit });
  
  // 2. THE MUTATION: Configured to auto-invalidate the 'Employees' tag
  const [softDelete] = useSoftDeleteEmployeeMutation();

  const handleDelete = async (id: string) => {
    try {
      // Execute the soft delete
      await softDelete({ id, isDeleted: true }).unwrap();
      
      // MAGIC HAPPENS HERE: We do NOTHING else.
      // Redux sees the 'Employees' tag was invalidated and automatically 
      // updates the grid UI with fresh data.
    } catch (error) {
      console.error("Failed to delete", error);
    }
  };

  if (isLoading) return <SkeletonGrid />;

  return (
    <Table data={data} onDelete={handleDelete} />
  );
}

```

### Example B: Live Data Polling (Dashboards)

For live metrics (like attendance or pending leave requests) that change frequently but don't require the heavy infrastructure of WebSockets, use RTK Query's polling feature.

**Crucial Rule:** The polling interval is *not* defined in the API Slice. It must be configured inside the React component using the hook options.

```tsx
"use client";

import { useGetLiveAttendanceQuery } from "@/lib/store/erpApiSlice";
import { pollingQueryStrategy } from "@/lib/api/client-strategies";

export function LiveAttendanceWidget() {
  // 1. Extract the standardized polling config from our strategies
  const { pollingConfig } = pollingQueryStrategy('/hr/attendance/live', 300000); // 5 mins

  // 2. Pass it into the RTK Query hook
  const { data, isLoading } = useGetLiveAttendanceQuery(undefined, pollingConfig);

  if (isLoading) return <Spinner />;

  return (
    <div className="stat-card">
      <h3>Live Attendance</h3>
      <p>{data?.total} checked in today</p>
    </div>
  );
}

```

---

## 🎯 Cheat Sheet: Which method do I use?

| Scenario | Location | Tool to Use |
| --- | --- | --- |
| **Fixed/Master Data** (Roles, Departments, Categories) | Server Component | `ServerAPI.get...()` |
| **Initial Dashboard Data** (Static shells) | Server Component | `ServerAPI.get...()` |
| **Dynamic Dashboard Blocks** | Server Component | `<Suspense>` + `ServerAPI.get...()` |
| **Heavy Data Tables** (Pagination, sorting, filtering) | Client Component | `use...TableQuery` |
| **CRUD Actions** (Create, Update, Delete) | Client Component | `use...Mutation` |
| **Live Metrics** (Countups, status checks) | Client Component | `use...Query` + `pollingConfig` |
| **Company Newsfeed** | Client Component | `use...Query` (Infinite Scroll strategy) |