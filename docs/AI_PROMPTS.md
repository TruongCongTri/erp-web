# Frontend Prompt Library — check-in-check-out-web

Sep 28, 2026 · @Trí Trương

## How to use these prompts

Each prompt below is ready to paste into Claude Code (or another coding agent) opened at the repo root. Replace every `{{placeholder}}`, delete lines that do not apply, and paste the **shared preamble** above the prompt the first time in a session. Each prompt names the reference files, so the agent copies existing patterns instead of inventing new ones. The section numbers refer to the Frontend Handover Guide ([DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)).

### Placeholders

| Placeholder | Example |
| --- | --- |
| `{{module}}` | `ats`, `hr`, `tickets` (folder under `components/` and `app/[locale]/(dashboard)/`) |
| `{{Resource}}` / `{{resource}}` / `{{resources}}` | `AssetRequest` / `asset-request` / `asset-requests` |
| `{{apiPath}}` | `/assets/requests` (relative to `/api/v1`) |
| `{{sliceFile}}` | `lib/store/assetApiSlice.ts` |
| `{{permResource}}` | `asset_request` (the backend permission resource slug) |
| `{{Namespace}}` | `Assets.Requests` (messages key) |
| `{{fields}}` | `code:string, title:string, status:AssetRequestStatus, departmentId:string, createdAt:string` |

### Shared preamble (paste once per session)

```text
You are working in the Next.js 16 + React 19 frontend "check-in-check-out-web".
Before writing code:
- Read AGENTS.md. This Next version differs from your training data; check node_modules/next/dist/docs/ before using any Next API (params are Promises, middleware is proxy.ts).
- Follow existing patterns exactly. Do not add new libraries.
Conventions:
- Route files in app/[locale]/(dashboard)/... only render a *Content component from components/<module>/.
- All API calls go through RTK Query slices in lib/store/*ApiSlice.ts. Types: PaginatedResponse<T>, SingleResponse<T> from types/modelsver2.ts.
- Toasts: gooeyToast from @/components/ui/goey-toaster. Buttons that act: ActionButton from @/components/buttons/ActionButton.
- Every user-facing string uses next-intl (useTranslations / getTranslations / rt). Add keys to BOTH messages/en.json and messages/vi.json.
- Links include the locale: /${locale}/...
- Use theme tokens (bg-card, text-muted-foreground, border-border, bg-primary) and existing CSS helpers (btn-primary, input-base, badge-success|warning|error|info|neutral, scrollbar-hide).
- Responsive: desktop table (hidden md:flex) + mobile card list.
When done: run `npm run lint`, fix what you introduced, and list the files you changed.
```

## 1. Add API endpoints (ApiSlice + store)

### 1a. Add endpoints to an existing slice

```text
Add these endpoints to {{sliceFile}}:
- GET    {{apiPath}}            -> list, query params: page, limit, search, sortBy, sortOrder, {{filters}}
- GET    {{apiPath}}/:id        -> detail
- POST   {{apiPath}}            -> create, body: {{createFields}}
- PATCH  {{apiPath}}/:id        -> update, body: Partial<create>
- PATCH  {{apiPath}}/:id/{{customAction}} -> body: {{customBody}}
- DELETE {{apiPath}}/:id

Entity {{Resource}}: {{fields}}

Follow lib/store/ticketApiSlice.ts exactly:
1. Put enums, the entity interface, Query{{Resource}}Dto and the request DTOs in the typed sections at the top of the file.
2. List -> builder.query<PaginatedResponse<{{Resource}}>, Query{{Resource}}Dto | void>. Drop undefined params; join array filters with ",".
   providesTags: each row { type: "{{Resource}}", id } + { type: "{{Resource}}", id: "LIST" }.
3. Detail -> builder.query<SingleResponse<{{Resource}}>, string>, providesTags [{ type, id }].
4. Mutations -> invalidatesTags the row id AND "LIST". Mutation args with a path id use { id, body }.
5. Add "{{Resource}}" to tagTypes and export every generated hook at the bottom.
Do not change existing endpoints. Show me the new hooks' names when done.
```

### 1b. Create a new slice and register it

```text
Create a new RTK Query slice for the {{module}} backend module at {{sliceFile}}.
- reducerPath: "{{module}}Api", baseQuery: baseQueryWithReauth from ./baseQuery (it adds the Bearer token and silently refreshes on 401).
- tagTypes: [{{tags}}]
- Endpoints: {{endpointList}} (same conventions as lib/store/ticketApiSlice.ts: typed DTO sections, LIST + id tags, invalidate row + LIST on mutations).
Then register it in lib/store/store.ts in all three places:
1. import,
2. combineReducers: [xxxApiSlice.reducerPath]: xxxApiSlice.reducer,
3. middleware .concat(..., xxxApiSlice.middleware).
Do NOT wrap it in persistReducer. Confirm the app compiles (npm run lint) and list the exported hooks.
```

### 1c. Server-side fetch for a Server Component

```text
Add a ServerAPI method in lib/api/server-api.ts named {{methodName}} that fetches {{apiPath}}.
Use fetchMasterData(path, ["{{cacheTag}}"], "{{cacheLife}}") if the data rarely changes, fetchLiveServerData(path) if it is live, or serverFetch if it must carry the user's cookie.
Type the return with an interface in types/modelsver2.ts. Follow lib/README.md.
```

## 2. Push notifications

### 2a. Refresh a page when the backend emits an event

```text
The backend socket.io gateway emits these events for {{module}}:
- "{{eventName1}}" with payload { {{payloadFields1}} }
- "{{eventName2}}" with payload { {{payloadFields2}} }

Add a virtual sync query `sync{{Module}}Events` to {{sliceFile}}, copying `syncAtsEvents` in lib/store/atsApiSlice.ts:
- builder.query<boolean, void> with queryFn: () => ({ data: true }).
- In onCacheEntryAdded: read the token with getCookie("accessToken"), return if missing; io(process.env.NEXT_PUBLIC_WS_URL || "http://localhost:5000", { auth: { token }, transports: ["websocket"] }).
- await cacheDataLoaded, then for each event: show gooeyToast.info(rt("{{realtimeKey}}", {...})) and dispatch({{slice}}.util.invalidateTags([...row id, LIST])).
- After await cacheEntryRemoved: socket.off every event and socket.disconnect().
Add the rt keys to the "Realtime" namespace in messages/en.json and messages/vi.json.
Export use{{Sync}}Query and call it once in {{pageOrLayoutFile}} (a module layout.tsx covers every page below it, like app/[locale]/(dashboard)/hr/ats/layout.tsx).
```

### 2b. React inside one component to an event

```text
In {{componentFile}}, react to the socket event "{{eventName}}" for the record currently shown (id = {{idVar}}).
Follow the JD_DRAFT_READY pattern: in the slice's socket handler (lib/store/notificationsApiSlice.ts getNotifications), re-dispatch it as window.dispatchEvent(new CustomEvent("{{DOM_EVENT}}", { detail: payload })).
In the component, add a useEffect that listens with window.addEventListener, ignores events whose payload id differs, updates local state / refetches, and removes the listener on cleanup.
```

### 2c. New notification type in the bell

```text
The backend now sends AppNotification items with category "{{category}}" and actionUrl "{{actionUrlPattern}}".
Make sure clicking it opens the right page: update resolveNotificationActionHref in lib/notificationLinks.ts if the backend path differs from the FE route ({{backendPath}} -> {{frontendRoute}}), keeping the locale prefix logic.
If the category needs its own icon/label, add it where NotificationBell.tsx and NotificationsContent.tsx map categories, with translations in the Notifications namespace.
If you add a new notifications list endpoint, add its name to PATCHABLE_ENDPOINTS so mark-as-read updates it.
```

## 3. Toast

```text
Add user feedback toasts to {{componentFile}} for these actions: {{actions}}.
Rules:
- Use gooeyToast from @/components/ui/goey-toaster only (not sonner, not components/ui/toast.tsx).
- For RTK mutations prefer gooeyToast.promise(mutation(args).unwrap(), { loading, success, error }).
- Read backend errors with a getErrorMessage(err, fallback) helper: err?.data?.meta?.message || err?.data?.message || err?.message, joining arrays with ", ". If lib/utils.ts has no such helper yet, add it there and import it.
- If the action is already an ActionButton/ActionSwitch with onAction, set loadingMessage / successMessage / errorMessage props instead of adding a second toast.
- All texts via t("toast.*") in the {{Namespace}} namespace; add keys to en.json and vi.json.
```

### 3b. Clean up toast inconsistencies (one-off)

```text
Find every toast call that is not gooeyToast (search for "sonner", "useToast", "toast.success(", "toast.error(") in components/ and app/.
Replace them with gooeyToast from @/components/ui/goey-toaster, keeping the same messages. components/buttons/LiveToggleCell.tsx imports "sonner", which is not in package.json.
Also move the getErrorMessage helper from components/ats/publishing/AutomationChannelsPanel.tsx to lib/utils.ts and reuse it there.
Do not change behavior otherwise. List the files changed.
```

## 4. List table page + drawer

```text
Build a standard list page for {{Resource}} in the {{module}} module.

Data: hooks use{{Resources}}Query / use{{Resource}}ByIdQuery / mutations from {{sliceFile}} (create them first if missing, following lib/store/ticketApiSlice.ts).
Entity fields: {{fields}}
Permissions: read = {{permResource}}:read:*, create = {{permResource}}:create:*

Copy the structure of components/ats/RecruitmentRequestsContent.tsx + components/ats/RecruitmentRequestDrawer.tsx. Create:
1. app/[locale]/(dashboard)/{{module}}/{{resources}}/page.tsx -> only renders <{{Resource}}sContent />.
2. components/{{module}}/{{Resource}}sContent.tsx ("use client"):
   - State synced to the URL: q, {{filterKeys}}, page, limit (300 ms debounced router.replace, scroll: false). Every filter change resets pageIndex to 0.
   - Query with page = pageIndex + 1, limit, search, filters. rows = res.data, totalRows = meta.pagination.total, pageCount = meta.pagination.total_page.
   - Columns (useMemo, ColumnDef<StockFeatures, {{Resource}}, any>[]): {{columns}}. Every column has meta.title and a SortHeader header. Status uses a STATUS_CONFIG map + badge-* classes + tStatus(status). Add an "actions" column (stopPropagation) with quick view (Eye) and open detail (ExternalLink Link).
   - Filters with FacetFilter: {{facets}} + "clear N filters" button.
   - Header bar: title, subtitle with count, ActionButtons Refresh (onAction: refetch) and Create (onClick opens {{createModalOrRoute}}, allowedPermissions ["{{permResource}}:create:any", "{{permResource}}:create:dept"], permissionBehavior "hide").
   - Desktop: <DataTable ... isLoading={isLoading || isFetching} skeletonRowCount={8} onRowClick={(row) => setSelected(row.original)} tabletHiddenColumns={[{{tabletHidden}}]} /> inside "hidden md:flex".
   - Mobile (< md): search input + filter bottom sheet + card rows + docked pager, as in the reference.
3. components/{{module}}/{{Resource}}Drawer.tsx using DetailDrawer + DrawerSection from @/components/layouts/DetailDrawer:
   - title, subtitle [code] · department, avatar icon, primary header.
   - Sections: {{drawerSections}} (label/value grid tiles).
   - Footer button "View detail" -> onClose() then router.push(`/${locale}/{{module}}/{{resources}}/${id}`).
4. Translations under {{Namespace}} in messages/en.json and messages/vi.json (title, subtitle, col_*, filters, empty, toast_*).
5. Sidebar entry (see prompt 8a) if requested: {{yesNo}}.
```

## 5. Table page with detail

### 5a. Split pane (table center, detail right)

```text
Build a master–detail page for {{Resource}} in {{module}}: table in the center, the selected row's detail in a collapsible right panel.
Copy the structure of components/tickets/TicketsContent.tsx (the <DetailLayout rightSidebar=...> block near the bottom).

1. Route app/[locale]/(dashboard)/{{module}}/{{resources}}/page.tsx renders <{{Resource}}sContent />.
2. {{Resource}}sContent: same list state/query/columns/filters as the standard list page (URL-synced, DataTable, FacetFilter). No drawer.
3. Wrap the table in <DetailLayout title={t("detail_title")} rightSidebar={{ collapsed: isRightCollapsed || !selected, onCollapseChange: setIsRightCollapsed, defaultCollapsed: true, content: (collapsed) => collapsed || !selected ? <empty hint> : <{{Resource}}DetailPane ... /> }}>.
   Row click: setSelected(row.original); setIsRightCollapsed(false).
4. {{Resource}}DetailPane (same folder): header (code, title, status badge), info sections ({{paneSections}}), and action buttons: {{paneActions}}.
   Each action is an ActionButton with allowedPermissions ["{{permResource}}:{{action}}:any", "{{permResource}}:{{action}}:dept"] and either onAction (direct call) or onClick opening a modal.
5. Modals for actions that need input ({{modalActions}}) are rendered after DetailLayout, each with isOpen / onClose / onSubmit / isLoading, like AssignTicketModal.
6. After a mutation, keep the pane in sync (use{{Resource}}ByIdQuery(selected.id) inside the pane, or set selected from the response).
7. Empty state: DataTable emptyMessage + emptyIcon.
All text in {{Namespace}} (en + vi).
```

### 5b. Table that opens a detail route

```text
Add a detail route for {{Resource}} and link it from the existing list page {{listContentFile}}.
1. app/[locale]/(dashboard)/{{module}}/{{resources}}/[id]/page.tsx: async server component; generateMetadata() uses getTranslations("Metadata.{{Resource}}Detail"); params is a Promise<{ id: string; locale: string }> -> await it and render <{{Resource}}Detail id={id} locale={locale} />.
2. In the list: drawer footer "View detail" and the actions-column ExternalLink both go to /${locale}/{{module}}/{{resources}}/${id}.
3. Build {{Resource}}Detail with the layout from prompt 6{{a_or_b}}.
4. Add Metadata.{{Resource}}Detail.title/description to both message files.
```

## 6. Detail pages

### 6a. Detail page with DetailLayout (vertical)

```text
Build components/{{module}}/{{Resource}}Detail.tsx using DetailLayout from @/components/layouts/DetailLayout.
Reference: components/employee/EmployeeDetailsContent.tsx.

Props: { id: string; onBack: () => void } (or locale). Data: use{{Resource}}ByIdQuery(id).
Declare every hook first, then:
- isLoading -> centered RefreshCw spinner + t("loading")
- isError or no data -> not-found block with icon, id, and "Back to list" ActionButton
Layout:
- title={t("title")}, onBack, headerActions = status badge.
- overlay when {{lockedCondition}}: blurred lock layer with message + back button.
- leftSidebar: collapsed -> avatar/icon rail with title tooltips; expanded -> summary card ({{leftFields}}).
- center children: {{centerContent}} (tabs or form).
- rightSidebar: DetailAccordion sections {{rightSections}}, open state in one useState object + toggle(key).
- footer: {{footerActions}} as ActionButtons (destructive ones use requireConfirm and variant="outline" + mr-auto on the left; primary save on the right). Each has allowedPermissions for {{permResource}}.
Mobile: keep default mobileMode="tabs".
All text in {{Namespace}}.Detail (en + vi).
```

### 6b. Detail page with HorizontalDetailLayout

```text
Build components/{{module}}/{{Resource}}Detail.tsx using HorizontalDetailLayout + HorizontalDetailAccordion from @/components/layouts/HorizontalDetailLayout.
Reference: components/ats/JobRecruitmentDetailContent.tsx (smaller) and components/ats/RecruitmentRequestDetail.tsx (full workflow).

Data: use{{Resource}}ByIdQuery(id); same loading / not-found handling as other detail pages.
Layout:
- title = breadcrumb (parent label > record title); onBack -> router.push(`/${locale}/{{module}}/{{resources}}`); headerActions = status badge + {{headerButtons}}.
- sidebar (not leftSidebar): collapsed icon rail / expanded context card with {{contextFields}}.
- children (center): {{mainContent}} (the main document, editor or viewer).
- sidePanel: HorizontalDetailAccordion panels {{panels}} (e.g. Workflow with a step badge, Metadata & audit). Only ONE open at a time: const [activePanel, setActivePanel] = useState<{{panelUnion}} | null>("{{defaultPanel}}"); toggle closes when clicking the open one.
- footer: workflow actions {{workflowActions}} as ActionButton / DropdownActionButton, each with allowedPermissions "{{permResource}}:<action>:any|dept", requireConfirm for irreversible steps, and toasts via loadingMessage/successMessage/errorMessage.
- mobileMode="tabs", centerTabLabel, sidePanelTabLabel.
If the backend emits events for this record, call the module's sync query (prompt 2a).
```

### 6c. Editor page with DetailLayoutVer2 (1/3 + 2/3)

```text
Build {{componentFile}} with DetailLayoutVer2 from @/components/layouts/DetailLayoutVer2:
left = { content: {{leftList}}, footer: {{leftFooter}} }, right = { content: {{rightForm}}, footer: {{rightFooter}} }.
Use DetailAccordionVer2 for collapsible groups in the right column. Selection in the left list drives the right form.
```

## 7. ActionButton and shared components

### 7a. Add an action button

```text
In {{componentFile}}, add a "{{actionLabel}}" button that calls {{mutationHook}}.
Use ActionButton from @/components/buttons/ActionButton (see app/[locale]/demo-btn/page.tsx for all variants):
- variant="{{variant}}" (primary | destructive | outline | ghost | secondary), iconOnly + tooltip if it is icon-only.
- onAction={() => {{mutation}}({{args}}).unwrap()}
- loadingMessage / successMessage / errorMessage={(err) => getErrorMessage(err, t("..."))}
- requireConfirm + confirmTitle / confirmMessage if the action is destructive or irreversible: {{yesNo}}
- allowedPermissions={[{{permissions}}]} and permissionBehavior="{{hideOrDisable}}"
- isLoading from the mutation state.
Do not add a separate toast or try/catch around it. Add the texts to {{Namespace}} (en + vi).
```

### 7b. Split / dropdown action

```text
Replace the separate buttons {{buttons}} in {{componentFile}} with one DropdownActionButton from @/components/buttons/DropdownActionButton.
Primary: label {{primaryLabel}}, onPrimaryAction {{primaryHandler}}. actions[]: {{items}}, each item with key, icon, label (title + small description like RecruitmentRequestDetail.tsx "send-head-approval"), onAction, and its own allowedPermissions / requireConfirm / danger as needed.
align="end", keep isLoading/disabled wired to the mutations.
```

### 7c. Toggle column

```text
Add an "{{field}}" toggle column to the table in {{componentFile}} using ActionSwitch from @/components/buttons/ActionSwitch:
checked={row.original.{{field}}}, onAction={(next) => {{mutation}}({ id: row.original.id, body: { {{field}}: next } }).unwrap()}, requireConfirm when turning off, success/error messages, wrapped in a div with onClick stopPropagation.
```

### 7d. Select inputs

```text
In {{formFile}}, use the shared pickers instead of native selects:
- Department -> DepartmentSelect from @/components/departments/DepartmentSelect (value, onChange, error).
- Role -> RoleCombobox from @/components/combobox/RoleCombobox.
- Any other list -> SearchableSelect from @/components/buttons/SearchableSelect with options { value, label, description?, icon? }[], isClearable, error.
Wire them to react-hook-form via Controller.
```

## 8. Auth guard (department + resource:action:scope)

Run 8d once first: it fixes the matcher inconsistencies so 8a–8c behave the same everywhere.

### 8a. Nav

```text
Add a Sidebar entry in components/layouts/Sidebar.tsx for {{Resource}}:
- Department group: {{deptId}} (existing item in deptGroups, or a new item with id, icon, resourceSlug "{{permResource or deptSlug}}").
- Child: { id: "{{navId}}", icon: <{{LucideIcon}} size={16} />, href: "/{{module}}/{{resources}}", resourceSlug: "{{permResource}}" }.
- href has no locale (the Sidebar adds it).
- Add Sidebar.items.{{navId}} (and Sidebar.groups.<key> if a new group) to messages/en.json and messages/vi.json.
The item must be hidden for users with no permission on {{permResource}} (canAccessResource).
```

### 8b. Page

```text
Protect every route under app/[locale]/(dashboard)/{{module}}/{{resources}}/ with a layout.tsx that wraps children in PermissionGuard from @/components/auth/PermissionGuard:
  allowedPermissions={["{{permResource}}:read:any", "{{permResource}}:read:dept", "{{permResource}}:read:own"]}
  behavior="redirect"
(see app/[locale]/(dashboard)/admin/users-access/layout.tsx). If only part of a page is restricted, wrap that part with behavior="fallback" and a small locked message instead.
If the route prefix is not in protectedPrefixes in proxy.ts, add it so anonymous users are redirected before the page renders.
```

### 8c. Action

```text
In {{componentFile}}, gate these actions by permission:
{{action}} -> {{permResource}}:{{verb}}:any | dept | own  (repeat per action)
- Buttons: ActionButton / DropdownActionButton items get allowedPermissions=[...] and permissionBehavior="{{hide|disable}}" (disable shows a lock icon + deniedTooltip).
- Non-button UI (tab, column, panel): wrap in <PermissionGuard allowedPermissions={[...]} behavior="hide">.
- Logic (form read-only, column list): at the top of the component, const { userPerms } = usePermissions(); derive booleans with the shared matcher from utils/permissionCheck.ts.
- Scope: for :own also require record.{{ownerField}} === currentUser.id; for :dept require record.{{deptField}} === currentUser department when the UI must differ per record.
Never rely only on the frontend check; mention in your summary which backend endpoints must enforce the same rule.
```

### 8d. One permission matcher (one-off refactor)

```text
There are four permission matchers that disagree:
- checkSinglePermission in components/buttons/ActionButton.tsx (wildcards + scope, *:*:any)
- checkPermission in utils/permissionCheck.ts (ignores scope)
- a local hasPermission in components/ats/RecruitmentRequestDetail.tsx (ignores scope)
- components/auth/PermissionGuard.tsx (exact string match only; *:*:any and resource "*" are NOT honored, so super admins are locked out)
Refactor:
1. Move checkSinglePermission into utils/permissionCheck.ts and export hasPermission(userPerms, required, requireAll) and hasResource(userPerms, resources, requireAll) built on it. Keep the rules: "*:*:any" passes; "*" matches any resource or action; user scope "any" satisfies any required scope; a required permission without scope matches any scope.
2. Also pass when roleSlug === "SUPER_ADMIN".
3. Use these helpers in ActionButton, DropdownActionButton, PermissionGuard, usePermissions (expose can(perm) / canAny(perms)) and RecruitmentRequestDetail.
4. Do not change component props. Show a before/after table of which checks changed result.
```

## 9. Other prompts

### 9a. Full new module (runs 1b → 4 → 5b → 6 → 8)

```text
Create the full frontend for a new module "{{module}}" / resource {{Resource}}.
Backend: {{apiPath}} (list, detail, create, update, delete, {{customActions}}), socket events {{events or none}}.
Entity: {{fields}}. Permission resource: {{permResource}} (actions read/create/update/delete/{{extra}}, scopes any/dept/own). Sidebar department: {{deptId}}.
Work in this order and stop after each step to show me the diff summary:
1. Slice + store registration (lib/store/ticketApiSlice.ts pattern, baseQueryWithReauth).
2. List page + drawer (components/ats/RecruitmentRequestsContent.tsx pattern).
3. Detail route + {{DetailLayout | HorizontalDetailLayout}} page.
4. Actions with ActionButton + permissions + toasts.
5. Socket sync query (if events).
6. Sidebar item + PermissionGuard layout.
7. en/vi translations, Metadata titles.
Follow the conventions in the shared preamble.
```

### 9b. Form with validation

```text
Build the {{formName}} form in {{componentFile}} with react-hook-form + zod + zodResolver (pattern: app/[locale]/(auth)/register/page.tsx).
Fields: {{fieldsWithRules}}. Build the schema inside the component so messages use t(). Show errors under each field.
On submit call {{mutation}}(values).unwrap(); on a backend validation error map it to fields with setError, otherwise gooeyToast.error(getErrorMessage(err, ...)). Disable submit while isSubmitting.
Use DepartmentSelect / SearchableSelect via Controller for pickers, input-base class for inputs.
```

### 9c. File upload

```text
Add a {{fileKind}} upload to {{componentFile}}.
Add a mutation in {{sliceFile}} that POSTs FormData to {{uploadPath}} (pattern: uploadSubmissionCv in lib/store/atsApiSlice.ts); do not set Content-Type.
UI: drop zone + file input (accept {{accept}}, max {{maxMB}} MB, validate before upload), progress/loading state, gooeyToast.promise feedback, show the returned file name/url.
To preview a private S3 file use GET /api/cv?key=<fileKey>&action=view (app/api/cv/route.ts).
```

### 9d. Translations

```text
Find hardcoded Vietnamese or English UI strings in {{fileOrFolder}} and move them to next-intl.
Use the existing namespace {{Namespace}} (or create it), add identical keys to messages/en.json and messages/vi.json with proper translations, and use useTranslations / getTranslations / rt (outside React, Realtime namespace). Keep code comments as they are.
```

### 9e. Audit an important UI event

```text
When the user {{event}} in {{componentFile}}, call trackUiEvent("{{ACTION}}", "{{resource}}", { {{metadata}} }) from @/utils/audit (pattern: components/buttons/SalaryReportButton.tsx).
Also add the Authorization: Bearer <accessToken cookie> header in utils/audit.ts if the endpoint requires auth (use getCookie from lib/store/baseQuery).
```

### 9f. Debug "FE calls nothing / BE receives nothing"

```text
The frontend does not reach the backend at {{apiUrl}}. Diagnose before changing code:
1. Which process owns ports 3000 and 5000? Is this repo's `next dev` actually on 3000?
2. CORS preflight from the real FE origin: curl -i -X OPTIONS {{apiUrl}}/auth/me -H "Origin: http://localhost:<fe port>" -H "Access-Control-Request-Method: GET". Is Access-Control-Allow-Origin returned? (backend ALLOWED_ORIGINS)
3. .env NEXT_PUBLIC_API_URL value and whether dev was restarted after editing it.
4. Is the slice's middleware registered in lib/store/store.ts? Is the query skipped (skip: true / missing token)?
Report findings, then propose the fix.
```

### 9g. Review a new page against conventions

```text
Review {{files}} against the handover conventions and list violations with file:line:
route file only renders a Content component; all API via RTK slices; gooeyToast only; ActionButton for actions with allowedPermissions; errors read via getErrorMessage; all strings translated in en + vi; locale in links; URL-synced list filters; mobile layout present; theme tokens instead of raw colors; no undefined CSS classes (badge-danger, custom-scrollbar).
Do not fix anything yet.
```
