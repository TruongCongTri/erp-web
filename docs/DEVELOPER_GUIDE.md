# Frontend Handover Guide — check-in-check-out-web

Sep 28, 2026 · @Trí Trương

## 0. Overview

The app is a Next.js 16 (App Router) + React 19 frontend. Client data goes through RTK Query, server data through `ServerAPI`, and the UI is built with Tailwind, shadcn/base-ui primitives and next-intl (vi/en). Read `node_modules/next/dist/docs/` before using a Next API, because v16 differs from older docs (for example, middleware is now `proxy.ts`).

### Folder map

| Path | What lives there |
| --- | --- |
| `app/[locale]/(auth)` | Login, register, verify, reset password (public) |
| `app/[locale]/(dashboard)` | All logged-in pages. `layout.tsx` calls `ServerAPI.getMe()` and wraps pages in `AppLayout` |
| `app/[locale]/(dashboard)/<module>/page.tsx` | Thin route file: renders one `*Content` component, nothing else |
| `components/<module>/` | Page bodies (`XxxContent.tsx`), drawers (`XxxDrawer.tsx`), details (`XxxDetail.tsx`) |
| `components/layouts/` | `AppLayout`, `Sidebar`, `Topbar`, `DetailLayout`, `DetailLayoutVer2`, `HorizontalDetailLayout`, `DetailDrawer` |
| `components/ui/` | Shared primitives: `DataTable`, `toast`, `NotificationBell`, shadcn parts |
| `components/buttons/` | `ActionButton`, `DropdownActionButton`, `SearchableSelect`, `ActionSwitch` |
| `components/auth/PermissionGuard.tsx` | Hide/disable UI by permission |
| `lib/store/` | Redux store + one `xxxApiSlice.ts` per backend module |
| `lib/api/server-api.ts` | Server-side fetches (Server Components / layouts) |
| `constants/endpoints.ts` | `API_BASE_URL` and the `API_ENDPOINTS` map |
| `hooks/usePermissions.ts`, `utils/permissionCheck.ts` | Permission checks |
| `messages/en.json`, `messages/vi.json` | Translations |
| `proxy.ts` | Route protection + locale routing (Next 16 replacement for middleware) |

### Running locally

1. Start the backend (`enterprise-nestjs-boilerplate`) on port 5000.
2. Check `.env`: `NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1`, `NEXT_PUBLIC_URL=http://localhost:3000`.
3. `npm run dev`. The frontend **must** run on port 3000: the backend CORS list (`ALLOWED_ORIGINS`, default `http://localhost:3000`) blocks any other port, and the browser then drops every API call silently. If Next says "Port 3000 is in use, using 3001", stop the other process or add the port to `ALLOWED_ORIGINS` on the backend.
4. `NEXT_PUBLIC_*` values are inlined at build/start time. Restart `npm run dev` after editing `.env`.

### Conventions

- A route file only imports and renders a `*Content` component. Logic, hooks and state live in `components/<module>/`.
- Every backend call goes through an RTK Query slice. Do not call `fetch`/`axios` directly from components.
- Response shapes are `PaginatedResponse<T>` (`data[]` + `meta.pagination`) and `SingleResponse<T>` (`data` + `message`) from `types/modelsver2.ts`.
- All user-facing text goes through `useTranslations("Namespace")` with keys in both `messages/en.json` and `messages/vi.json`.
- Links use the locale: build them as `/${locale}/...` or use `Link`/`useRouter` from `@/i18n/routing`.
- `npm run generate` (plop) scaffolds boilerplate from `plop-templates/`.

## 1. Add an API endpoint (ApiSlice + store)

Each backend module has one RTK Query slice in `lib/store/xxxApiSlice.ts`. To add a call, either add an endpoint to an existing slice (common case) or create a new slice and register it in `lib/store/store.ts` (new module). The reference slices to copy are `ticketApiSlice.ts` and `departmentApiSlice.ts`.

### A. Add an endpoint to an existing slice

1. Add the path to `constants/endpoints.ts` under `API_ENDPOINTS` if the module already keeps paths there (paths are relative to `API_BASE_URL`, which already ends in `/api/v1`).
2. In the slice file, declare the entity, query DTO and mutation DTO interfaces at the top (sections `1. ENUMS`, `2. ENTITIES`, `3. REQUEST DTOS`).
3. Add the endpoint inside `endpoints: (builder) => ({ ... })`:

```ts
// list: builder.query<Response, Args>
getTickets: builder.query<PaginatedResponse<Ticket>, QueryTicketDto | void>({
  query: (params) => ({ url: "/tickets", method: "GET", params: params || {} }),
  providesTags: (result) =>
    result?.data
      ? [...result.data.map(({ id }) => ({ type: "Ticket" as const, id })), { type: "Ticket", id: "LIST" }]
      : [{ type: "Ticket", id: "LIST" }],
}),

// detail
getTicketById: builder.query<SingleResponse<Ticket>, string>({
  query: (id) => `/tickets/${id}`,
  providesTags: (result, error, id) => [{ type: "Ticket", id }],
}),

// mutation: invalidate the row AND the list so tables refetch
resolveTicket: builder.mutation<SingleResponse<Ticket>, { id: string; body: ResolveTicketDto }>({
  query: ({ id, body }) => ({ url: `/tickets/${id}/resolve`, method: "PATCH", body }),
  invalidatesTags: (result, error, { id }) => [{ type: "Ticket", id }, { type: "Ticket", id: "LIST" }],
}),
```

4. Add any new tag name to the slice's `tagTypes` array.
5. Export the generated hook at the bottom: `export const { useGetTicketsQuery, useResolveTicketMutation } = ticketApiSlice;`.
6. Arrays in query params are sent comma-joined (`status: ["A","B"]` → `status=A,B`), as `getTickets` does. Follow that rule so the backend parses them.

### B. Create a new slice and register it in the store

1. Create `lib/store/<module>ApiSlice.ts`:

```ts
import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseQuery";
import { PaginatedResponse, SingleResponse } from "@/types/modelsver2";

export const assetApiSlice = createApi({
  reducerPath: "assetApi",          // unique across the store
  baseQuery: baseQueryWithReauth,    // see note on base queries below
  tagTypes: ["Asset"],
  endpoints: (builder) => ({ /* ... */ }),
});
export const { useGetAssetsQuery } = assetApiSlice;
```

2. Open `lib/store/store.ts` and make three edits:
   1. `import { assetApiSlice } from "./assetApiSlice";`
   2. In `combineReducers`: `[assetApiSlice.reducerPath]: assetApiSlice.reducer,`
   3. In `.concat(...)` of the middleware: `assetApiSlice.middleware,`
3. Forgetting the middleware line is the usual bug: hooks return `isLoading` forever or tags never refetch.
4. Do not persist the slice unless it is public, rarely-changing data. Only `publicApi` is persisted (`persistReducer`). All state except `publicApi` is wiped on `auth/logout`.

### Base query: which one

| Base query | Adds token | Silent refresh on 401 | Handles `PENDING_VERIFICATION` / `ACCOUNT_SUSPENDED` |
| --- | --- | --- | --- |
| `baseQuery` | Yes (cookie `accessToken` → `Authorization: Bearer`) | No | No |
| `baseQueryWithReauth` | Yes | Yes (mutex-guarded, retries once) | Yes, redirects |

Today `authApi`, `userApi`, `publicApi` and `erpApi` use `baseQueryWithReauth`. The others (`ats`, `hr`, `admin`, `ticket`, `department`, `notifications`, `auditLog`) use plain `baseQuery`, so an expired token there shows as an error instead of refreshing. Use `baseQueryWithReauth` for new slices.

### C. Use it in a component

```tsx
"use client";
const { data, isLoading, isFetching, error } = useGetTicketsQuery({ page, limit: 20, search });
const rows = data?.data ?? [];
const pagination = data?.meta.pagination;

const [resolveTicket, { isLoading: resolving }] = useResolveTicketMutation();
await resolveTicket({ id, body: { resolutionNote } }).unwrap(); // unwrap() throws on error
```

- Skip a query until its input exists: `useGetTicketByIdQuery(id, { skip: !id })`.
- Server Components cannot use hooks. Add a method to `ServerAPI` in `lib/api/server-api.ts` instead (`fetchMasterData` for cached master data, `fetchLiveServerData` for live data, `serverFetch` for auth-bound calls).

## 2. Push notifications (WebSocket)

Realtime events come from the NestJS gateway over socket.io (`NEXT_PUBLIC_WS_URL`, default `http://localhost:5000`, token in `auth.token`). The frontend listens inside RTK Query `onCacheEntryAdded`: the socket opens when a component subscribes to the query and closes when the last subscriber unmounts. `lib/NotificationProvider.tsx` is a mock and is not wired in; do not build on it.

### Existing channels

| Query hook | Slice | Socket events | What it does |
| --- | --- | --- | --- |
| `useGetNotificationsQuery()` | notifications | `notification`, `jd_draft_ready`, `jd_draft_failed` | Prepends to the bell list, shows a toast, fires `window` events `JD_DRAFT_READY` / `JD_DRAFT_FAILED` |
| `useGetNotificationsListQuery({ page: 1 })` | notifications | `notification` | Prepends on page 1 only, trims to `limit` |
| `useSyncAtsEventsQuery()` | ats | `job_post.approval_requested`, `ats.cv_screened`, … | Toast + `invalidateTags` so ATS tables refetch |
| `useGetNewPendingClaimsCountQuery()` | hr | `invalidate_pending_claims` | Increments a counter badge |

The bell (`components/ui/NotificationBell.tsx`), `Topbar` and `Sidebar` already call `useGetNotificationsQuery`, so the `notification` stream is live on every dashboard page.

### A. Show a notification in the bell

Nothing to do on the frontend. The backend emits `notification` with an `AppNotification` payload. Set `actionUrl` on the backend; the UI turns it into a locale-aware link with `resolveNotificationActionHref(actionUrl, locale)` from `lib/notificationLinks.ts`. Use `notificationDetailHref(id, locale)` to link to a notification's detail drawer.

### B. Refresh a page's data when a backend event fires (recommended pattern)

Add a "virtual" query to the module's slice that only holds the socket, then invalidate tags on each event:

```ts
syncTicketEvents: builder.query<boolean, void>({
  queryFn: () => ({ data: true }),
  async onCacheEntryAdded(arg, { dispatch, cacheDataLoaded, cacheEntryRemoved }) {
    const token = getCookie("accessToken");
    if (!token) return;
    const socket: Socket = io(process.env.NEXT_PUBLIC_WS_URL || "http://localhost:5000", {
      auth: { token },
      transports: ["websocket"],
    });
    try {
      await cacheDataLoaded;
      socket.on("ticket.updated", (data: { ticketId: string }) => {
        gooeyToast.info(rt("ticket_updated"));
        dispatch(ticketApiSlice.util.invalidateTags([
          { type: "Ticket", id: data.ticketId },
          { type: "Ticket", id: "LIST" },
        ]));
      });
    } catch { /* no-op */ }
    await cacheEntryRemoved;
    socket.off("ticket.updated");
    socket.disconnect();
  },
}),
```

1. Export `useSyncTicketEventsQuery` from the slice.
2. Call `useSyncTicketEventsQuery();` once at the top of the page component (see `JobPostsContent.tsx`), or in a module `layout.tsx` to cover every page under it (see `app/[locale]/(dashboard)/hr/ats/layout.tsx`).
3. Always `socket.off(...)` every event you registered and `disconnect()` after `cacheEntryRemoved`.

### C. Push a live item into a cached list

Use `updateCachedData((draft) => { draft.data.unshift(item); })` instead of invalidating, as `getNotifications` does. Use it only when the payload is the full row; otherwise invalidate tags.

### D. React to an event inside a specific component

For one-off UI (e.g. the JD editor), the slice re-broadcasts as a DOM event. Listen in the component:

```tsx
useEffect(() => {
  const onReady = (e: Event) => {
    const { requestId, data } = (e as CustomEvent).detail;
    if (requestId === id) setDraft(data);
  };
  window.addEventListener("JD_DRAFT_READY", onReady);
  return () => window.removeEventListener("JD_DRAFT_READY", onReady);
}, [id]);
```

### E. Mark as read

`useMarkAsReadMutation()` and `useMarkAllAsReadMutation()` patch every live notification cache optimistically (`patchNotificationCaches`) and roll back on failure. If you add a new notification list endpoint, add its name to `PATCHABLE_ENDPOINTS` or its badge will not update.

Note: each hook above opens its own socket. That is fine for 3–4 channels; if more are added, move to one shared socket module.

## 3. Toast

Use `gooeyToast` from `@/components/ui/goey-toaster` everywhere (about 170 call sites). The toaster is mounted once in `app/[locale]/layout.tsx` (`position="top-right"`, `richColors`, `closeButton`), so there is nothing to set up per page.

### Basic calls

```tsx
import { gooeyToast } from "@/components/ui/goey-toaster";

gooeyToast.success(t("toast.create_success"));
gooeyToast.error(t("toast.create_error"));
gooeyToast.info(title, { description: body });
gooeyToast.warning(t("toast.incomplete"));
```

### Toast around an API call

Preferred: wrap the mutation in `gooeyToast.promise`. It shows loading → success/error on one toast.

```tsx
gooeyToast.promise(createTicket(body).unwrap(), {
  loading: t("toast.creating"),
  success: () => t("toast.create_success"),
  error: (err) => getErrorMessage(err, t("toast.create_error")),
});
```

Or the `try/catch` form used in most Content files:

```tsx
try {
  await createTicket(body).unwrap();
  gooeyToast.success(t("toast.create_success"));
  onClose();
} catch (err: any) {
  gooeyToast.error(getErrorMessage(err, t("toast.create_error")));
}
```

### Reading the backend error message

The backend puts the message in `err.data.meta.message` (standard) or `err.data.message` (validation, sometimes an array). Use this helper (copy of the one in `components/ats/publishing/AutomationChannelsPanel.tsx`; worth moving to `lib/utils.ts`):

```ts
function getErrorMessage(err: any, fallback: string): string {
  const msg = err?.data?.meta?.message || err?.data?.message || err?.message;
  if (Array.isArray(msg)) return msg.join(", ");
  return msg || fallback;
}
```

### Rules

- Toast text must be translated: `t("...")` in components, `rt("key")` from `@/lib/i18n/runtimeTranslator` outside React (slices, socket handlers). `rt` reads the `Realtime` namespace in `messages/*.json`.
- If you use `ActionButton` or `ActionSwitch`, do not add your own toast: they already call `gooeyToast.promise` with `loadingMessage` / `successMessage` props (section 7).
- Do not use `components/ui/toast.tsx` (base-ui toast) or `sonner`. `components/buttons/LiveToggleCell.tsx` imports `sonner`, which is not in `package.json`; switch it to `gooeyToast`.

## 4. Standard \[resource\] list page + drawer

A list page is a route file, a `XxxContent.tsx` that owns filters/pagination and renders `DataTable`, and a `XxxDrawer.tsx` built on `DetailDrawer` for quick view. The reference implementation is `components/ats/RecruitmentRequestsContent.tsx` + `RecruitmentRequestDrawer.tsx`; `components/employee/EmployeeManagementContent.tsx` + `EmployeeDrawer.tsx` is a second example.

### Files to create

| File | Purpose |
| --- | --- |
| `app/[locale]/(dashboard)/<module>/<resource>/page.tsx` | `export default function Page() { return <ResourceContent />; }` |
| `components/<module>/ResourceContent.tsx` | `"use client"`, state, query, columns, `DataTable`, mobile list |
| `components/<module>/ResourceDrawer.tsx` | Quick-view drawer |
| `lib/store/<module>ApiSlice.ts` | `getResources` + mutations (section 1) |
| `messages/en.json`, `messages/vi.json` | `<Module>.<Resource>` namespace |
| `components/layouts/Sidebar.tsx` | Nav entry (section 8) |

### Step 1: state, synced with the URL

```tsx
const searchParams = useSearchParams();
const [globalFilter, setGlobalFilter] = useState(searchParams.get("q") || "");
const [statusFilter, setStatusFilter] = useState<string[]>(searchParams.get("status")?.split(",").filter(Boolean) || []);
const [pagination, setPagination] = useState<PaginationState>({
  pageIndex: Math.max(0, parseInt(searchParams.get("page") || "1", 10) - 1),
  pageSize: parseInt(searchParams.get("limit") || "10", 10),
});
const [selected, setSelected] = useState<Resource | null>(null); // drawer
```

A 300 ms debounced `useEffect` writes `q`, `status`, `page`, `limit` back with `router.replace(url, { scroll: false })`, so filters survive reload and back-navigation. Every filter change resets `pageIndex` to 0 via a `handleFilterChange(setter, value)` helper.

### Step 2: query

```tsx
const { data: listRes, isLoading, isFetching, refetch } = useGetResourcesQuery({
  page: pagination.pageIndex + 1,
  limit: pagination.pageSize,
  search: globalFilter || undefined,
  status: statusFilter.length ? statusFilter : undefined,
});
const rows = listRes?.data || [];
const totalRows = listRes?.meta?.pagination?.total || 0;
const pageCount = listRes?.meta?.pagination?.total_page || 1;
```

### Step 3: columns

Define `useMemo<ColumnDef<StockFeatures, Resource, any>[]>(() => [...], [t])`. Conventions:

- `meta: { title }` on every column: the column-visibility menu reads it.
- Header: `({ column }) => <SortHeader column={column}>{t("col_x")}</SortHeader>`.
- Optional `select` column with `TriStateCheckbox` + `enableMultiRowSelection`.
- Status cells: a `STATUS_CONFIG: Record<Status, { className; icon }>` map at the top of the file, label from `tStatus(status)`. Use the `badge-success | badge-warning | badge-error | badge-info | badge-neutral` classes, or `DataBadge` for a dot badge.
- An `actions` column (`id: "actions"`, `header: () => null`) wraps its cell in `onClick={(e) => e.stopPropagation()}` so the row click does not also fire. Put quick-view (`Eye`), open-detail (`Link`), and `ActionButton`/`DropdownActionButton` there.

Sorting: `DataTable` uses `manualSorting` but keeps its sort state internal, so clicking a header does not reach the API. If a page needs server sort, pass `sortBy`/`sortOrder` through your own state.

### Step 4: filters

```tsx
const facetFiltersNode = (
  <div className="flex items-center gap-2 flex-wrap">
    <FacetFilter label={t("col_status")} options={statusOptions} selected={statusFilter}
      onChange={(v) => handleFilterChange(setStatusFilter, v)} />
    {activeFilterCount > 0 && <button onClick={clearAllFilters}>{t("clear_n_filters", { count: activeFilterCount })}</button>}
  </div>
);
```

Options are `{ value, label, count? }`. Department options come from `useGetDepartmentsQuery({ isActive: true, limit: 100, sortBy: "name", sortOrder: "ASC" })`.

### Step 5: layout

```tsx
<div className="flex flex-col h-full overflow-hidden bg-background">
  {/* header bar: h1 title + subtitle count + ActionButtons (Export / Refresh / Create) */}
  {/* mobile (< md): search + filter sheet + card rows + docked pager */}
  <div className="flex-1 min-h-0 overflow-hidden flex-col hidden md:flex">
    <DataTable
      columns={columns} data={rows}
      pageCount={pageCount} totalRows={totalRows}
      pagination={pagination} onPaginationChange={setPagination}
      globalFilter={globalFilter} onGlobalFilterChange={(v) => handleFilterChange(setGlobalFilter, v)}
      facetFilters={facetFiltersNode}
      isLoading={isLoading || isFetching} skeletonRowCount={8}
      tabletHiddenColumns={["createdAt"]}
      onRowClick={(row) => setSelected(row.original)}
    />
  </div>
  {selected && <ResourceDrawer item={selected} onClose={() => setSelected(null)}
    onNavigateDetail={() => router.push(`/${locale}/<module>/<resource>/${selected.id}`)} />}
</div>
```

Pass `isLoading || isFetching` so the skeleton shows on page change. Mobile uses a separate card list (`MobileRequisitionRow` in the reference) because the table is `hidden md:flex`.

### Step 6: the drawer

```tsx
import { DetailDrawer, DrawerSection } from "@/components/layouts/DetailDrawer";

export default function ResourceDrawer({ item, onClose, onNavigateDetail }: Props) {
  const [open, setOpen] = useState({ overview: true, history: false });
  const toggle = (k: keyof typeof open) => setOpen((s) => ({ ...s, [k]: !s[k] }));
  return (
    <DetailDrawer
      isOpen={!!item} onClose={onClose}
      title={item.name} subtitle={`[${item.code}]`}
      icon={<div className="w-9 h-9 rounded-full bg-accent ...">{item.code.slice(-3)}</div>}
      headerClassName="bg-primary text-primary-foreground border-b border-border"
      footer={<button className="btn-primary w-full" onClick={() => { onClose(); onNavigateDetail(); }}>{t("view_detail")}</button>}
    >
      <DrawerSection title={t("overview")} icon={<Briefcase size={14} />}
        isExpanded={open.overview} onToggle={() => toggle("overview")}>
        <div className="grid grid-cols-2 gap-2">{/* label/value tiles */}</div>
      </DrawerSection>
    </DetailDrawer>
  );
}
```

`DetailDrawer` handles the backdrop, body scroll lock, full width on mobile / `md:max-w-md` on desktop and the safe-area footer. Pass the row object for instant display; if the drawer needs more fields than the list returns, call `useGetResourceByIdQuery(item.id)` inside it.

## 5. Table page with detail

There are two formats. Pick **A (split pane)** when users triage many rows in a row (tickets, notifications, access rights). Pick **B (separate route)** when the detail is heavy and needs its own URL (employee, candidate, recruitment request).

| Format | Reference | Detail shown in | URL per record |
| --- | --- | --- | --- |
| A. Split pane | `components/tickets/TicketsContent.tsx`, `components/role/UsersAccessContent.tsx` | `DetailLayout` `rightSidebar`, collapses to icons | No (state only) |
| B. Table → route | `RecruitmentRequestsContent.tsx` → `ats/request-management/[id]` | Its own page (section 6) | Yes |

### A. Split pane: table in the center, detail on the right

```tsx
const [selected, setSelected] = useState<Resource | null>(null);
const [isRightCollapsed, setIsRightCollapsed] = useState(true);

<DetailLayout
  title={t("detail_title")}
  rightSidebar={{
    collapsed: isRightCollapsed || !selected,
    onCollapseChange: setIsRightCollapsed,
    defaultCollapsed: true,
    content: (collapsed) =>
      collapsed || !selected
        ? <EmptyHint icon={<TicketIcon size={48} />} text={t("select_item")} />
        : <ResourceDetailPane item={selected} onApprove={...} isApproving={...} />,
  }}
>
  <div className="flex-1 min-h-0 flex-col flex bg-background relative">
    <DataTable
      /* same props as section 4 */
      onRowClick={(row) => { setSelected(row.original); setIsRightCollapsed(false); }}
      emptyMessage={t("empty")}
      emptyIcon={<TicketIcon size={32} className="text-muted-foreground/30" />}
    />
  </div>
</DetailLayout>
```

Steps:

1. Keep the page header bar (title + `ActionButton`s) above `DetailLayout`, as in section 4.
2. Put `DataTable` as `children` (the center column).
3. Build `ResourceDetailPane` as a plain component in the same folder. It receives the row, plus callbacks and `isXxx` loading flags for each action.
4. Open action forms as modals rendered after `DetailLayout` (`CreateTicketModal`, `AssignTicketModal`, … in TicketsContent), each with `isOpen`, `onClose`, `onSubmit`, `isLoading`.
5. After a mutation, refresh the selected row: call `useGetResourceByIdQuery(selected.id)` inside the pane, or replace `selected` with the mutation response.
6. On mobile, `DetailLayout` switches to tabs (`mobileMode="tabs"` default) so the pane becomes its own tab.

### B. Table that opens a detail route

1. Route file `app/[locale]/(dashboard)/<module>/<resource>/[id]/page.tsx`. In Next 16 `params` is a **Promise**:

```tsx
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Metadata.ResourceDetail");
  return { title: t("title"), description: t("description") };
}
export default async function Page({ params }: { params: Promise<{ id: string; locale: string }> }) {
  const { id, locale } = await params;
  return <ResourceDetail id={id} locale={locale} />;
}
```

A client route file can use `useParams()` instead, as `hr/employee-management/[id]/page.tsx` does.

2. From the list, link three ways: row click opens the drawer (section 4); the drawer footer button calls `router.push` to `/{locale}/<module>/<resource>/{id}`; the actions column has an `ExternalLink` icon inside a `Link` to the same path.
3. The detail component fetches with `useGetResourceByIdQuery(id)` and renders one of the layouts in section 6.
4. Back navigation: pass `onBack={() => router.back()}` to the layout. Because list filters live in the URL (section 4, step 1), going back restores them.
5. Add `Metadata.ResourceDetail.title/description` to both message files.

## 6. Detail pages

Three layouts live in `components/layouts/`. Use **DetailLayout** (3 columns, vertical accordions) for record pages like employee or profile. Use **HorizontalDetailLayout** (side panels that slide open horizontally) for workflow-heavy records like recruitment requests, job posts or candidates. **DetailLayoutVer2** (fixed 1/3 + 2/3 split) is not used by any page yet.

| Layout | Import | Used by | Structure |
| --- | --- | --- | --- |
| `DetailLayout` | `@/components/layouts/DetailLayout` | `EmployeeDetailsContent`, `ProfileDetailsContent`, `CandidateDetailsContent` | Header + left sidebar + center `children` + right sidebar + footer. Sidebars collapse to an icon rail on desktop; tabs on mobile |
| `HorizontalDetailLayout` | `@/components/layouts/HorizontalDetailLayout` | `RecruitmentRequestDetail`, `JobPostDetailContent`, `JobRecruitmentDetailContent`, `CandidateDetail` | Header + left `sidebar` + center `children` + `sidePanel` of `HorizontalDetailAccordion`s that expand sideways (full page on mobile) + footer |
| `DetailLayoutVer2` | `@/components/layouts/DetailLayoutVer2` | none | Left 1/3 + right 2/3, each with its own footer |

### Shared skeleton for any detail component

```tsx
"use client";
export default function ResourceDetail({ id, onBack }: { id: string; onBack: () => void }) {
  const t = useTranslations("Module.ResourceDetail");
  const { data, isLoading, isError } = useGetResourceByIdQuery(id);
  const [sections, setSections] = useState({ info: true, history: true });
  const toggle = (k: keyof typeof sections) => setSections((p) => ({ ...p, [k]: !p[k] }));
  // declare ALL hooks above the early returns

  if (isLoading) return <CenteredSpinner label={t("loading")} />;
  if (isError || !data?.data) return <NotFound onBack={onBack} />;
  const item = data.data;
  // ...layout below
}
```

Copy the loading and not-found blocks from `EmployeeDetailsContent.tsx` (spinner `RefreshCw`, `UserX` icon + "back to list" `ActionButton`).

### A. DetailLayout (vertical)

```tsx
<DetailLayout
  title={t("title")}
  onBack={onBack}
  headerActions={<StatusBadge status={item.status} />}
  overlay={item.isDeleted && <LockedOverlay onBack={onBack} />}
  leftSidebar={{
    defaultCollapsed: false,
    content: (collapsed) => collapsed ? <AvatarRail item={item} /> : <ProfileCard item={item} />,
  }}
  rightSidebar={{
    defaultCollapsed: false,
    content: (collapsed) => collapsed ? <IconRail /> : (
      <>
        <DetailAccordion title={t("stats")} icon={<ActivitySquare size={14} />}
          isExpanded={sections.info} onToggle={() => toggle("info")}>...</DetailAccordion>
        <DetailAccordion title={t("history")} icon={<Clock size={14} />}
          isExpanded={sections.history} onToggle={() => toggle("history")}>...</DetailAccordion>
      </>
    ),
  }}
  footer={<>
    <ActionButton variant="outline" className="mr-auto" ...>{t("delete")}</ActionButton>
    <ActionButton variant="primary" onAction={save} successMessage={t("saved")}>{t("save")}</ActionButton>
  </>}
>
  {/* center: main tabs / form */}
</DetailLayout>
```

- Every sidebar `content` gets `collapsed`. Render a narrow icon rail (avatar, icons with `title` tooltips) when `true`, and the full panel when `false`.
- `overlay` is an absolutely positioned layer for locked, deleted or terminated records.
- Optional props: `sidebarWidth` (default `lg:w-[320px]`), `mobileMode` `"tabs" | "stack"`, `defaultMobileTab`, `centerTabLabel`, `centerTabIcon`.

### B. HorizontalDetailLayout

```tsx
const [activePanel, setActivePanel] = useState<"workflow" | "metadata" | null>("workflow");
const togglePanel = (p: "workflow" | "metadata") => setActivePanel((prev) => (prev === p ? null : p));

<HorizontalDetailLayout
  title={<Breadcrumb parent={t("breadcrumb")} current={item.title} />}
  onBack={() => router.push(`/${locale}/<module>/<resource>`)}
  headerActions={<StatusBadge status={item.status} />}
  sidebar={{ defaultCollapsed: false, content: (collapsed) => collapsed ? <IconRail /> : <ContextCard item={item} /> }}
  sidePanel={<>
    <HorizontalDetailAccordion title={t("workflow")} icon={<Activity size={14} />}
      badge={<span className="...">3</span>}
      isExpanded={activePanel === "workflow"} onToggle={() => togglePanel("workflow")}>
      ...
    </HorizontalDetailAccordion>
    <HorizontalDetailAccordion title={t("metadata")} icon={<Clock size={14} />}
      isExpanded={activePanel === "metadata"} onToggle={() => togglePanel("metadata")}>
      ...
    </HorizontalDetailAccordion>
  </>}
  footer={<ActionButtons />}
  mobileMode="tabs" centerTabLabel={t("content")} sidePanelTabLabel={t("workflow")}
>
  {/* center: the document / editor / CV viewer */}
</HorizontalDetailLayout>
```

- Keep only one side panel open at a time (the single `activePanel` state above). Collapsed panels shrink to a 44 px strip with vertical text.
- Tune widths with `expandedWidth` (default `lg:w-[420px]`), `collapsedWidth` (`lg:w-11`) and `contentMinWidth`.
- `leftSidebar` is an alias of `sidebar`; use `sidebar` in new code.

### C. DetailLayoutVer2

`<DetailLayoutVer2 left={{ content, footer }} right={{ content, footer }} overlay={...} />` with `DetailAccordionVer2` sections. Use it for editor-style pages where the left third is a list and the right two thirds is a form or matrix.

## 7. Custom components: ActionButton and shared UI

Use `ActionButton` for every button that triggers an action. It bundles the permission check, confirm dialog, loading spinner, promise toast and tooltip, so pages never hand-roll these. A live showcase is at `/{locale}/demo-btn` (`app/[locale]/demo-btn/page.tsx`).

### ActionButton props

| Group | Prop | Notes |
| --- | --- | --- |
| Action | `onAction: () => Promise<any>` | Runs inside `gooeyToast.promise`; the button shows a spinner until it settles |
| Action | `onClick` | Plain handler, no toast. Use it to open modals or drawers |
| Toast | `loadingMessage`, `successMessage` (string or `(data) => string`), `errorMessage` (string or `(err) => string`), `toastOptions` | Defaults come from `Common.Action` messages |
| Confirm | `requireConfirm`, `confirmTitle`, `confirmMessage`, `confirmLabel`, `cancelLabel` | Opens a portal dialog before `onAction` |
| Permission | `allowedPermissions: string[]`, `allowedResources: string[]`, `requireAllPermissions`, `permissionBehavior: "hide" \| "disable"`, `deniedTooltip`, `showLockIcon` | See section 8 |
| Look | `variant: "primary" \| "destructive" \| "outline" \| "ghost" \| "secondary"`, `iconOnly`, `tooltip`, `className` | Override sizes with `!h-8 !px-3 !text-xs` |
| State | `isLoading`, `disabled`, `isUnderDevelopment` | `isUnderDevelopment` shows a "coming soon" toast instead of acting |

### Common recipes

```tsx
// 1. API action with toast
<ActionButton
  variant="primary"
  onAction={() => approveItem(id).unwrap()}
  loadingMessage={t("approving")}
  successMessage={t("approved")}
  errorMessage={(err) => getErrorMessage(err, t("approve_error"))}
>
  <Check size={14} /> {t("approve")}
</ActionButton>

// 2. Destructive with confirm + permission
<ActionButton
  variant="destructive"
  requireConfirm
  confirmTitle={t("delete_title")}
  confirmMessage={t("delete_msg", { name })}
  allowedPermissions={["ats_job_post:delete:any", "ats_job_post:delete:dept"]}
  permissionBehavior="disable"
  onAction={() => deleteItem(id).unwrap()}
  successMessage={t("deleted")}
>
  <Trash2 size={14} />
</ActionButton>

// 3. Icon-only with tooltip
<ActionButton iconOnly variant="ghost" tooltip={t("refresh")} onAction={() => refetch()}>
  <RefreshCw size={14} />
</ActionButton>

// 4. Just open a modal
<ActionButton variant="primary" onClick={() => setShowCreate(true)}>
  <Plus size={14} /> {t("create")}
</ActionButton>
```

Gotchas:

- Always pass `errorMessage` as a function when calling RTK mutations. The default reads `err.message`, but RTK errors carry the text in `err.data.meta.message` / `err.data.message`.
- To show a yellow "partial" result, throw `{ type: "warning", message }` from `onAction`.
- `ActionButton` calls `stopPropagation`, so it is safe inside clickable table rows.

### Other shared components

| Component | Import | Use for |
| --- | --- | --- |
| `DropdownActionButton` | `@/components/buttons/DropdownActionButton` | Split button: `label`, `icon`, `onPrimaryAction`, and `actions[]`. Each action item accepts every `ActionButton` prop (`onAction`, `requireConfirm`, `allowedPermissions`, …) plus `danger`, `closeOnClick` |
| `ActionSwitch` | `@/components/buttons/ActionSwitch` | Toggle with `onAction(newChecked)`, confirm and promise toast. Use for "active / live" columns |
| `SearchableSelect` | `@/components/buttons/SearchableSelect` | Searchable single select: `options: { value, label, icon?, description?, disabled? }[]`, `value`, `onChange`, `isClearable`, `error` |
| `DepartmentSelect` | `@/components/departments/DepartmentSelect` | Department picker wired to `useGetDepartmentsQuery` |
| `RoleCombobox` | `@/components/combobox/RoleCombobox` | Role picker: `availableRoles`, `selectedRoleId`, `onChange` |
| `PasswordInput` | `@/components/input/PasswordInput` | react-hook-form password field with show/hide: `registration={register("password")}` |
| `DataTable`, `SortHeader`, `FacetFilter`, `TriStateCheckbox`, `DataBadge`, `MobileFilterSheet` | `@/components/ui/DataTable` | Tables (section 4) |
| `DetailDrawer`, `DrawerSection` | `@/components/layouts/DetailDrawer` | Quick-view drawer (section 4) |
| `DetailLayout`, `HorizontalDetailLayout`, `DetailLayoutVer2` + accordions | `@/components/layouts/...` | Detail pages (section 6) |
| `PermissionGuard` | `@/components/auth/PermissionGuard` | Wrap any non-button UI by permission (section 8) |
| `GridCalendar`, `calendar`, `popover`, `dialog`, `dropdown-menu`, `select`, `switch`, `tooltip`, `input`, `textarea` | `@/components/ui/...` | shadcn / base-ui primitives |
| `AppIcon`, `AppImage`, `AppLogo`, `TourTooltip` | `@/components/ui/...` | Icon by name, image with fallback, logo, onboarding tour tip |

Style helpers in `app/globals.css`: `btn-primary`, `input-base`, `badge-success | badge-warning | badge-error | badge-info | badge-neutral`, `badge-ats-* / badge-hris-*`, `scrollbar-hide`, `fade-in`. Use theme tokens (`bg-card`, `text-muted-foreground`, `border-border`, `bg-primary`) instead of raw colors so dark mode and the color switcher (`ColorSwitcherFAB`) keep working.

Note: `badge-danger` and `custom-scrollbar` are used in several components but are not defined in `globals.css`, so they render unstyled. Use `badge-error` and `scrollbar-hide`, or add the missing classes.

## 8. Auth guard: department + resource:action:scope

Access is decided on the frontend by the logged-in user's `permissions: string[]` (from `/auth/me`, stored in Redux `auth.user`). Every permission is `resource:action:scope`, e.g. `ats_job_post:create:dept`. The frontend only hides or blocks UI; the backend must still enforce every rule and filter data by scope.

### The permission model

| Part | Examples | Meaning |
| --- | --- | --- |
| resource | `hr`, `ats_requisition`, `ats_job_post`, `it_system`, `audit_log`, `leave_request`, `*` | A module or entity. Sidebar departments use the same slugs |
| action | `read`, `create`, `update`, `delete`, `approve`, `*` | What the user may do |
| scope | `any`, `dept`, `own` | `any` = all records, `dept` = records of the user's department, `own` = records the user created |

`*:*:any` (or role slug `SUPER_ADMIN`) passes every check. "Department" appears in three places: (1) the Sidebar groups nav items by department and hides a department whose `resourceSlug` the user has no permission on; (2) `usePermissions().primaryDashboard` picks the home dashboard (HR, IT, SALES, FINANCE, …) from `role.slug`; (3) `:dept` scope limits data to the user's department, which the backend applies.

### Layers of protection

| Layer | Where | What it checks |
| --- | --- | --- |
| 1. Logged in | `proxy.ts` (`protectedPrefixes`: `/dashboard`, `/users`, `/ats`, `/settings`) + `(dashboard)/layout.tsx` (`ServerAPI.getMe()`, redirects to login on 401) | Has a valid `accessToken` cookie |
| 2. Nav | `components/layouts/Sidebar.tsx` | `canAccessResource(resourceSlug)`: user has any permission on that resource |
| 3. Page / section | `PermissionGuard` in a `layout.tsx` or around page content | `allowedResources` or `allowedPermissions` |
| 4. Action | `ActionButton` / `DropdownActionButton` props, or `PermissionGuard behavior="hide"` | Full `resource:action:scope` match |

### A. Nav item

Add the item to `topNavItems` or to a department in `deptGroups` in `Sidebar.tsx`:

```tsx
{
  id: "hr",                  // label = t("Sidebar.items.hr")
  resourceSlug: "hr",        // department hidden unless user has any hr:* permission
  icon: <Users size={18} />,
  children: [
    { id: "hr-employees", icon: <UserCheck size={16} />, href: "/hr/employee-management" },
    { id: "hr-leave", icon: <Calendar size={16} />, href: "/under-development", resourceSlug: "leave_request" },
  ],
}
```

1. `href` has no locale; the Sidebar prefixes it.
2. Add `Sidebar.items.<id>` (and `Sidebar.groups.<groupKey>` for a new group) to both message files.
3. Items without `resourceSlug` are always visible. Children are filtered one by one with their own `resourceSlug`.
4. The Sidebar only checks the resource, not the action. If a page needs `read`, guard the page too (B).

### B. Page

Wrap the route in a `layout.tsx` so every sub-route inherits it (the pattern in `admin/layout.tsx`):

```tsx
import PermissionGuard from "@/components/auth/PermissionGuard";

export default function ModuleLayout({ children }: { children: React.ReactNode }) {
  return (
    <PermissionGuard allowedPermissions={["hr:read:any", "hr:read:dept", "it_system:read:any"]}>
      {children}
    </PermissionGuard>
  );
}
```

- `allowedResources={["it_system", "hr"]}`: any permission on those resources.
- `allowedPermissions`: listed permissions (OR by default; `requireAll` for AND).
- `behavior`: `"redirect"` (default: lock screen + 5 s countdown → `/{locale}/dashboard`), `"fallback"` (render `fallback`), `"hide"` (render nothing).
- While `auth.isInitialized` is false it shows a spinner, so there is no flash of forbidden content.

### C. Action (button, menu item, section)

Buttons: put the rule on `ActionButton` itself.

```tsx
<ActionButton
  allowedPermissions={["ats_requisition:update:any", "ats_requisition:update:dept"]}
  permissionBehavior="hide"          // or "disable" → lock icon + deniedTooltip
  requireConfirm onAction={cancel}
>
  {t("cancel_request")}
</ActionButton>
```

Non-button UI (a tab, a column, a panel): wrap it in `<PermissionGuard allowedPermissions={[...]} behavior="hide">`.

Logic inside a component (enable a form, pick columns): derive booleans once at the top, as `RecruitmentRequestDetail.tsx` does:

```tsx
const { userPerms } = usePermissions();
const canApprove = checkPermission(userPerms, ["ats_requisition:approve:any", "ats_requisition:approve:dept"]);
const canEdit = checkPermission(userPerms, ["ats_requisition:update:any"]) ||
  (checkPermission(userPerms, ["ats_requisition:update:own"]) && req.requesterId === user.id);
```

For `:dept` and `:own`, compare the record's department or owner with the user when the UI must differ per record. The backend still decides.

### Known inconsistencies (fix before relying on them)

There are four permission matchers, and they disagree:

| Matcher | Wildcards `*` | Scope | `*:*:any` / SUPER\_ADMIN |
| --- | --- | --- | --- |
| `checkSinglePermission` in `ActionButton.tsx` | Yes | Yes (`any` covers `dept`/`own`) | Yes |
| `checkPermission` in `utils/permissionCheck.ts` | Yes | Ignored | `*:*:any` only |
| local `hasPermission` in `RecruitmentRequestDetail.tsx` | Yes | Ignored | `*:*:any` only |
| `PermissionGuard` | No (exact match only) | Exact | **No**: a super admin with only `*:*:any` is locked out of `allowedPermissions` pages |

Recommendation: move `checkSinglePermission` from `ActionButton.tsx` into `utils/permissionCheck.ts`, export it as the single matcher, and use it in `PermissionGuard`, `usePermissions` and page code. Also note `proxy.ts` does not list `/hr`, `/admin`, `/tickets` in `protectedPrefixes`; the dashboard layout's `getMe()` still redirects anonymous users, but only after a server round-trip.

## 9. Other how-tos

### i18n (vi / en)

1. Add keys to **both** `messages/en.json` and `messages/vi.json` under the module namespace (top-level keys today: `Common`, `Sidebar`, `DataTable`, `ATS`, `HR`, `Employee`, `Tickets`, `Notifications`, `Realtime`, `Metadata`, …).
2. Client: `const t = useTranslations("ATS.Requests"); t("subtitle", { count })`. Server: `const t = await getTranslations("Metadata.X")`.
3. Outside React (slices, socket handlers): `rt("key", values)` from `@/lib/i18n/runtimeTranslator`, which reads the `Realtime` namespace through `RuntimeTranslatorBridge`.
4. Enum labels live under a sub-namespace (`ATS.RequestStatus.<STATUS>`), read with `tStatus(status)`.
5. Dates: `useLocale() === "en" ? "en-US" : "vi-VN"` for `toLocaleDateString`, or `date-fns`.
6. Default locale is `vi` in `i18n/routing.ts` but `en` in the `createIntlMiddleware` call in `proxy.ts`. Align them if redirects land on the wrong language.

### Forms

Use `react-hook-form` + `zod` + `zodResolver`, as in `app/[locale]/(auth)/register/page.tsx`. Build the schema inside the component so messages use `t(...)`. Show field errors under the input, and map backend validation errors with `setError(field, { message })`. Small modal forms in `TicketsContent.tsx` use plain `useState`; that is fine for 1–3 fields.

### File upload

Send `FormData` straight to a mutation (`uploadSubmissionCv`, `submitCandidateManual` in `atsApiSlice.ts`); the backend uploads to S3 and returns `fileKey`/`url`. Do not set `Content-Type` yourself; fetch adds the multipart boundary. To view a private S3 file, call the Next route `GET /api/cv?key=...` (`app/api/cv/route.ts`), which returns a presigned URL using the server-only AWS keys in `.env`.

### Server-side data

For Server Components and layouts, add a method to `ServerAPI` in `lib/api/server-api.ts`: `fetchMasterData(path, tags, cacheLife)` for rarely-changing data (departments, roles), `fetchLiveServerData(path)` for live data, `serverFetch` for calls that need the user's cookie. See `lib/README.md`.

### Audit trail

Important UI events go to the backend audit log with `trackUiEvent(action, resource, metadata)` from `@/utils/audit` (see `SalaryReportButton.tsx`). It does not send the auth token today; add the `Authorization` header if the endpoint requires it. The audit UI is at `/admin/audit` and `/audit-log`.

### Route states and placeholders

- Add `loading.tsx` / `error.tsx` next to a heavy `page.tsx` (see `hr/employee-management/loading.tsx`, `admin/role-permission-matrix/error.tsx`).
- Link unfinished nav items to `/under-development`.
- `npm run generate` → plop "page" generator scaffolds `page.tsx` + optional `layout`, `loading`, `error`, `not-found`, `template`, `_components` from `plop-templates/route`.

### New module checklist

- [ ] Backend endpoints + permission slugs agreed (`resource:action:scope`)
- [ ] Slice: types, endpoints, tags, hooks (section 1); registered in `store.ts` if new
- [ ] List page + drawer (section 4) or split pane (section 5A)
- [ ] Detail route + layout (sections 5B, 6)
- [ ] Actions via `ActionButton` with `allowedPermissions` + toasts (sections 3, 7)
- [ ] Socket sync query if the backend emits events (section 2)
- [ ] Sidebar item with `resourceSlug`, `PermissionGuard` layout (section 8)
- [ ] `en.json` + `vi.json` keys, `Metadata.*` titles
- [ ] Mobile check at < 768 px (card list, filter sheet, drawer)
- [ ] `npm run lint` and `npm run build` pass (husky runs hooks on commit)
