/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useMemo } from "react";
import { useTable, stockFeatures, flexRender } from "@tanstack/react-table";
import type {
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  RowSelectionState,
  PaginationState,
  StockFeatures,
} from "@tanstack/react-table";
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  SlidersHorizontal,
  X,
  Check,
  Search,
  Filter,
  Minus,
} from "lucide-react";

// ─── Custom Tri-State Checkbox ──────────────────────────────────────────────
export function TriStateCheckbox({
  checked,
  indeterminate,
  onChange,
}: {
  checked: boolean;
  indeterminate?: boolean;
  onChange: (e: React.MouseEvent) => void;
}) {
  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onChange(e);
      }}
      className={`w-4 h-4 flex items-center justify-center rounded border transition-colors cursor-pointer ${
        checked || indeterminate
          ? "bg-primary border-primary text-primary-foreground"
          : "border-input bg-background hover:bg-muted"
      }`}
    >
      {checked && !indeterminate && <Check size={12} strokeWidth={3} />}
      {indeterminate && <Minus size={12} strokeWidth={3} />}
    </div>
  );
}

// ─── Dot & Neutral Badge ───────────────────────────────────────────────────────
export interface BadgeConfig {
  label: string;
  dotClass: string;
}

export function DataBadge({ config }: { config: BadgeConfig }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md border border-border/70 bg-card text-[11px] font-medium text-foreground whitespace-nowrap shadow-sm">
      <span className={`w-1.5 h-1.5 rounded-full ${config.dotClass}`} />
      {config.label}
    </span>
  );
}

// ─── Sort header button ────────────────────────────────────────────────────────
export function SortHeader({
  column,
  children,
}: {
  column: any;
  children: React.ReactNode;
}) {
  if (!column.getCanSort()) {
    return (
      <span className="text-xs font-semibold text-muted-foreground truncate w-full block">
        {children}
      </span>
    );
  }
  const sorted = column.getIsSorted();
  return (
    <button
      onClick={column.getToggleSortingHandler()}
      className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground select-none group transition-colors w-full text-left"
    >
      <span className="truncate">{children}</span>
      <span className="flex flex-col ml-auto flex-shrink-0">
        {sorted === "asc" ? (
          <ChevronUp size={12} className="text-primary" />
        ) : sorted === "desc" ? (
          <ChevronDown size={12} className="text-primary" />
        ) : (
          <ChevronsUpDown
            size={12}
            className="text-muted-foreground/40 group-hover:text-muted-foreground"
          />
        )}
      </span>
    </button>
  );
}

// ─── Column visibility dropdown ────────────────────────────────────────────────
function ColumnVisibilityDropdown({ table }: { table: any }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-border rounded bg-card hover:bg-muted transition-colors"
      >
        <SlidersHorizontal size={13} />
        <span className="hidden sm:inline">Cột</span>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-50 bg-card border border-border rounded-lg shadow-lg p-2 min-w-[180px]">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2 py-1 mb-1">
              Hiển thị cột
            </p>
            {table
              .getAllLeafColumns()
              .filter((col: any) => col.id !== "select" && col.id !== "actions")
              .map((col: any) => {
                const title = col.columnDef.meta?.title ?? col.id;
                return (
                  <label
                    key={col.id}
                    className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted cursor-pointer"
                  >
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${
                        col.getIsVisible()
                          ? "bg-primary border-primary"
                          : "border-border"
                      }`}
                    >
                      {col.getIsVisible() && (
                        <Check size={10} className="text-white" />
                      )}
                    </div>
                    <span className="text-xs text-foreground capitalize">
                      {title}
                    </span>
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={col.getIsVisible()}
                      onChange={col.getToggleVisibilityHandler()}
                    />
                  </label>
                );
              })}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Rows Per Page Dropdown ────────────────────────────────────────────────────
function RowsPerPageDropdown({
  value,
  onChange,
  options = [10, 20, 30, 50],
}: {
  value: number;
  onChange: (val: number) => void;
  options?: number[];
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-between gap-2 h-7 px-2.5 text-xs font-medium border border-border rounded bg-card hover:bg-muted transition-colors min-w-[64px]"
      >
        <span>{value}</span>
        <ChevronDown size={12} className="text-muted-foreground" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute bottom-full left-0 mb-1 z-50 bg-card border border-border rounded-lg shadow-lg p-1.5 min-w-[100px] animate-in fade-in zoom-in-95 duration-100">
            {options.map((opt) => (
              <button
                key={opt}
                onClick={() => {
                  onChange(opt);
                  setOpen(false);
                }}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs hover:bg-muted cursor-pointer transition-colors text-left"
              >
                <div
                  className={`w-3.5 h-3.5 rounded-[3px] border flex items-center justify-center flex-shrink-0 transition-colors ${
                    value === opt
                      ? "bg-primary border-primary"
                      : "border-border bg-background"
                  }`}
                >
                  {value === opt && (
                    <Check size={10} className="text-primary-foreground" />
                  )}
                </div>
                <span className="text-foreground">{opt}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Facet filter pill & Mobile Filter ─────────────────────────────────────────
interface FacetOption {
  value: string;
  label: string;
  count?: number;
}
interface FacetFilterProps {
  label: string;
  options: FacetOption[];
  selected: string[];
  onChange: (values: string[]) => void;
}
export function FacetFilter({
  label,
  options,
  selected,
  onChange,
}: FacetFilterProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase()),
  );
  const active = selected.length > 0;

  const toggle = (val: string) => {
    if (selected.includes(val)) onChange(selected.filter((v) => v !== val));
    else onChange([...selected, val]);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border rounded transition-colors ${
          active
            ? "border-primary bg-primary/10 text-primary"
            : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
        }`}
      >
        {label}
        {active && (
          <span className="ml-1 flex items-center gap-0.5">
            {selected.slice(0, 2).map((v) => (
              <span
                key={v}
                className="bg-primary text-white text-[9px] px-1.5 py-0.5 rounded-full leading-none"
              >
                {v}
              </span>
            ))}
            {selected.length > 2 && (
              <span className="bg-primary text-white text-[9px] px-1.5 py-0.5 rounded-full leading-none">
                +{selected.length - 2}
              </span>
            )}
          </span>
        )}
        {active && (
          <span
            onClick={(e) => {
              e.stopPropagation();
              onChange([]);
            }}
            className="ml-1 hover:text-red-500 transition-colors"
          >
            <X size={11} />
          </span>
        )}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-1 z-50 bg-card border border-border rounded-lg shadow-lg w-56">
            <div className="p-2 border-b border-border">
              <div className="relative">
                <Search
                  size={12}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Tìm kiếm..."
                  className="w-full pl-7 pr-3 py-1.5 text-xs border border-border rounded bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                  autoFocus
                />
              </div>
            </div>
            <div className="max-h-48 overflow-y-auto py-1">
              {filtered.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-3">
                  Không có kết quả
                </p>
              ) : (
                filtered.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => toggle(opt.value)}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-muted transition-colors text-left"
                  >
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${selected.includes(opt.value) ? "bg-primary border-primary" : "border-border"}`}
                    >
                      {selected.includes(opt.value) && (
                        <Check size={10} className="text-white" />
                      )}
                    </div>
                    <span className="flex-1 text-foreground">{opt.label}</span>
                    {opt.count !== undefined && (
                      <span className="text-[10px] text-muted-foreground tabular-nums">
                        {opt.count}
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
            {selected.length > 0 && (
              <div className="p-2 border-t border-border">
                <button
                  onClick={() => onChange([])}
                  className="w-full text-xs text-center text-muted-foreground hover:text-foreground transition-colors py-1"
                >
                  Xóa bộ lọc
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

interface MobileFilterSheetProps {
  children: React.ReactNode;
  activeCount?: number;
  onClearAll?: () => void;
}
export function MobileFilterSheet({
  children,
  activeCount = 0,
  onClearAll,
}: MobileFilterSheetProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border rounded transition-colors ${activeCount > 0 ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground"}`}
      >
        <Filter size={13} />
        Bộ lọc
        {activeCount > 0 && (
          <span className="bg-primary text-white text-[9px] px-1.5 py-0.5 rounded-full leading-none">
            {activeCount}
          </span>
        )}
      </button>
      {open && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-2xl border-t border-border shadow-2xl animate-slide-up">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <span className="text-sm font-semibold text-foreground">
                Bộ lọc
              </span>
              <div className="flex items-center gap-3">
                {activeCount > 0 && onClearAll && (
                  <button
                    onClick={onClearAll}
                    className="text-xs text-red-600 hover:underline"
                  >
                    Xóa tất cả
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  className="p-1 rounded hover:bg-muted"
                >
                  <X size={16} className="text-muted-foreground" />
                </button>
              </div>
            </div>
            <div className="p-4 flex flex-wrap gap-2 max-h-[60vh] overflow-y-auto">
              {children}
            </div>
            <div className="px-4 pb-6 pt-2">
              <button
                onClick={() => setOpen(false)}
                className="w-full btn-primary text-sm py-2.5"
              >
                Áp dụng
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}

// ─── Main DataTable component ──────────────────────────────────────────────────
export interface DataTableProps<TData extends Record<string, any>> {
  columns: ColumnDef<StockFeatures, TData, any>[];
  data: TData[];
  toolbar?: React.ReactNode;
  facetFilters?: React.ReactNode;
  mobileFacetFilters?: React.ReactNode;
  globalFilter?: string;
  onGlobalFilterChange?: (value: string) => void;
  pagination?: PaginationState;
  onPaginationChange?: React.Dispatch<React.SetStateAction<PaginationState>>;
  rowsPerPageLabel?: string;
  tabletHiddenColumns?: string[];
  isFetching?: boolean;
  isLoading?: boolean;
  skeletonRowCount?: number;
  pageCount?: number;
  totalRows?: number;
  onRowClick?: (row: any) => void;

  enableMultiRowSelection?: boolean;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
  searchPlaceholder?: string;
}

export function DataTable<TData extends Record<string, any>>({
  columns,
  data,
  toolbar,
  facetFilters,
  mobileFacetFilters,
  globalFilter,
  onGlobalFilterChange,
  pagination,
  onPaginationChange,
  rowsPerPageLabel = "Hàng / trang",
  tabletHiddenColumns = [],
  isFetching = false,
  isLoading = false,
  skeletonRowCount = 5,
  pageCount,
  totalRows = 0,
  onRowClick,
  enableMultiRowSelection = false,
  emptyMessage,
  emptyIcon,
  searchPlaceholder,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<
    Record<string, boolean>
  >({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const [internalPagination, setInternalPagination] = useState<PaginationState>(
    {
      pageIndex: 0,
      pageSize: 10,
    },
  );

  const isControlledPagination = pagination !== undefined;
  const currentPagination = isControlledPagination
    ? pagination
    : internalPagination;
  const handlePaginationChange = isControlledPagination
    ? onPaginationChange!
    : setInternalPagination;

  const table = useTable({
    features: stockFeatures as any,
    data,
    columns,
    // FIX: Provide a stable ID so React Table does not rebuild the row model when data updates locally
    getRowId: (row: any) => row.id,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination: currentPagination,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: handlePaginationChange,
    onGlobalFilterChange,
    enableMultiRowSelection,
    enableMultiSort: true,
    manualPagination: true,
    pageCount: pageCount ?? -1,
    manualSorting: true,
  } as any);

  const selectedCount = Object.keys(rowSelection).length;
  const displayTotal =
    totalRows > 0
      ? totalRows
      : table.getFilteredRowModel()?.rows?.length || data.length;
  const paginatedRows = table.getRowModel().rows;
  const sortedPageRows = paginatedRows;

  return (
    <div className="flex-1 h-full flex flex-col overflow-hidden relative">
      <div className="flex-shrink-0 px-4 py-2.5 border-b border-border bg-card flex items-center gap-3 flex-wrap">
        {onGlobalFilterChange !== undefined && (
          <div className="relative flex-1 min-w-[200px] max-w-xs hidden sm:block">
            <Search
              size={14}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              value={globalFilter ?? ""}
              onChange={(e) => onGlobalFilterChange(e.target.value)}
              placeholder={searchPlaceholder || "Tìm kiếm..."}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-border rounded bg-background focus:outline-none focus:ring-1 focus:ring-ring transition-all"
            />
          </div>
        )}
        <div className="hidden md:flex items-center gap-2 flex-wrap">
          {facetFilters}
        </div>
        <div className="flex md:hidden items-center gap-2 flex-1">
          {mobileFacetFilters}
        </div>
        <div className="ml-auto flex items-center gap-2">
          {toolbar}
          <ColumnVisibilityDropdown table={table} />
        </div>
      </div>

      <div className="w-full h-0.5 bg-transparent relative overflow-hidden z-20 flex-shrink-0">
        {isFetching && (
          <div className="absolute inset-y-0 bg-primary animate-[indeterminate_1.5s_infinite_linear] w-1/3 rounded-full" />
        )}
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto [scrollbar-gutter:stable]">
        <table
          className="w-full text-sm border-collapse table-fixed"
          style={{ minWidth: "1100px" }}
        >
          <thead className="bg-muted border-b border-border sticky top-0 z-30">
            {table.getHeaderGroups().map((hg: any) => (
              <tr key={hg.id}>
                {hg.headers.map((header: any, idx: number) => {
                  const isFirst = idx === 0;
                  const isLast = idx === hg.headers.length - 1;
                  const colId = header.column.id;
                  const isTabletHidden = tabletHiddenColumns.includes(colId);
                  return (
                    <th
                      key={header.id}
                      className={`px-3 py-2.5 text-left whitespace-nowrap bg-muted ${
                        isFirst
                          ? "sticky left-0 z-40 shadow-[2px_0_4px_rgba(0,0,0,0.06)]"
                          : ""
                      } ${
                        isLast
                          ? "sticky right-0 z-40 shadow-[-2px_0_4px_rgba(0,0,0,0.06)]"
                          : ""
                      } ${isTabletHidden ? "hidden lg:table-cell" : ""}`}
                      style={{
                        width: header.column.getSize(),
                        minWidth: header.column.getSize(),
                        maxWidth: header.column.getSize(),
                      }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: skeletonRowCount }).map((_, i) => (
                <tr key={`skel-${i}`} className="border-b border-border/50">
                  {table.getVisibleLeafColumns().map((col: any, j: number) => {
                    const isFirst = j === 0;
                    const isLast =
                      j === table.getVisibleLeafColumns().length - 1;
                    const isTabletHidden = tabletHiddenColumns.includes(col.id);
                    return (
                      <td
                        key={col.id}
                        className={`px-3 py-3.5 bg-card ${
                          isFirst
                            ? "sticky left-0 z-20 shadow-[2px_0_4px_rgba(0,0,0,0.04)]"
                            : ""
                        } ${
                          isLast
                            ? "sticky right-0 z-20 shadow-[-2px_0_4px_rgba(0,0,0,0.04)]"
                            : ""
                        } ${isTabletHidden ? "hidden lg:table-cell" : ""}`}
                      >
                        <div className="h-4 bg-muted animate-pulse rounded-md w-full" />
                      </td>
                    );
                  })}
                </tr>
              ))
            ) : sortedPageRows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-16">
                  <div className="flex flex-col items-center gap-2">
                    {emptyIcon || (
                      <Search size={32} className="text-muted-foreground/30" />
                    )}
                    {emptyMessage || (
                      <p className="text-sm font-medium text-muted-foreground">
                        Không tìm thấy dữ liệu
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              sortedPageRows.map((row: any) => {
                const isRowSelected = row.getIsSelected();
                return (
                  <tr
                    key={row.id}
                    onClick={() => {
                      table.toggleAllRowsSelected(false);
                      row.toggleSelected();
                      if (onRowClick) onRowClick(row);
                    }}
                    className={`border-b border-border/50 transition-colors cursor-pointer hover:bg-muted/40 ${
                      isRowSelected ? "bg-primary/5" : ""
                    }`}
                  >
                    {row.getVisibleCells().map((cell: any, idx: number) => {
                      const isFirst = idx === 0;
                      const isLast = idx === row.getVisibleCells().length - 1;
                      const colId = cell.column.id;
                      const isTabletHidden =
                        tabletHiddenColumns.includes(colId);
                      return (
                        <td
                          key={cell.id}
                          className={`px-3 py-2.5 bg-card truncate ${
                            isFirst
                              ? "sticky left-0 z-20 shadow-[2px_0_4px_rgba(0,0,0,0.04)]"
                              : ""
                          } ${
                            isLast
                              ? "sticky right-0 z-20 shadow-[-2px_0_4px_rgba(0,0,0,0.04)]"
                              : ""
                          } ${isTabletHidden ? "hidden lg:table-cell" : ""} ${
                            isRowSelected ? "!bg-primary/5" : ""
                          }`}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex-shrink-0 sticky bottom-0 px-4 h-[var(--topbar-height,56px)] border-t border-border bg-card flex items-center gap-4 flex-wrap z-30">
        <span className="text-xs text-muted-foreground tabular-nums min-w-[160px]">
          Đã chọn {selectedCount} / {displayTotal} hàng.
        </span>
        <div className="flex-1" />
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground whitespace-nowrap hidden sm:inline">
            {rowsPerPageLabel}
          </span>
          <RowsPerPageDropdown
            value={table.state.pagination.pageSize}
            onChange={(size) => table.setPageSize(size)}
          />
        </div>
        <span className="text-xs text-muted-foreground tabular-nums whitespace-nowrap">
          Trang {table.state.pagination.pageIndex + 1} /{" "}
          {table.getPageCount() || 1}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            className="w-7 h-7 flex items-center justify-center rounded border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronsLeft size={13} />
          </button>
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="w-7 h-7 flex items-center justify-center rounded border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={13} />
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="w-7 h-7 flex items-center justify-center rounded border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={13} />
          </button>
          <button
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            className="w-7 h-7 flex items-center justify-center rounded border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronsRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
