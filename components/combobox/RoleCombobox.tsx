import { Role } from "@/types/modelsver2";
import {
  Check,
  ChevronDown,
  Search,
  ShieldAlert,
  X,
} from "lucide-react";
import React, { useMemo } from "react";
import { useEffect, useState } from "react";

// ─── Whisper Badge Component ───────────────────────────────────────────────────
function Badge({ config }: { config: { label: string; className: string } }) {
  return <span className={`badge ${config.className}`}>{config.label}</span>;
}

const roleTypeConfig: Record<string, { label: string; className: string }> = {
  default: { label: "Mặc định", className: "badge-info" },
  custom: { label: "Tùy chỉnh", className: "badge-neutral" },
};

// ─── Searchable Role Combobox ────────────────────────────────────────────────
export function RoleCombobox({
  availableRoles,
  selectedRoleId,
  onChange,
}: {
  availableRoles: Role[];
  selectedRoleId: string;
  onChange: (val: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const filteredRoles = useMemo(() => {
    return availableRoles.filter(
      (r) =>
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.slug?.toLowerCase().includes(search.toLowerCase()),
    );
  }, [availableRoles, search]);

  const selectedRole = availableRoles.find((r) => r.id === selectedRoleId);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`flex items-center justify-between w-full px-3.5 py-2.5 text-sm bg-background border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
          open
            ? "border-primary ring-2 ring-primary/20"
            : "border-border hover:bg-muted/50"
        }`}
      >
        {selectedRole ? (
          <div className="flex flex-col items-start text-left min-w-0 pr-2">
            <span className="text-xs font-bold text-foreground truncate w-full">
              {selectedRole.name}
            </span>
            <span className="text-[10px] text-muted-foreground font-mono mt-0.5 truncate w-full">
              {selectedRole.slug}
            </span>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">
            -- Tìm và chọn vai trò --
          </span>
        )}
        <div className="flex items-center gap-2 flex-shrink-0">
          {selectedRole && selectedRole.isDefault && (
            <Badge config={roleTypeConfig.default} />
          )}
          <ChevronDown
            size={14}
            className={`text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      {/* Dropdown Menu (Shadcn style Popover + Command) */}
      {open && (
        <div className="absolute top-full left-0 z-50 w-full mt-1.5 bg-card border border-border rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Search Input */}
          <div className="flex items-center px-3 border-b border-border bg-muted/20">
            <Search
              size={14}
              className="text-muted-foreground mr-2 flex-shrink-0"
            />
            <input
              type="text"
              placeholder="Nhập tên hoặc mã vai trò..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full py-3 text-xs bg-transparent outline-none placeholder:text-muted-foreground text-foreground"
              autoFocus
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="p-1 hover:bg-muted rounded text-muted-foreground"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Options List */}
          <div className="max-h-[240px] overflow-y-auto p-1.5 scrollbar-thin">
            {filteredRoles.length === 0 ? (
              <div className="py-8 text-center flex flex-col items-center justify-center">
                <ShieldAlert
                  size={24}
                  className="text-muted-foreground/30 mb-2"
                />
                <p className="text-xs font-medium text-muted-foreground">
                  Không tìm thấy vai trò
                </p>
              </div>
            ) : (
              filteredRoles.map((role) => {
                const isSelected = role.id === selectedRoleId;
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => {
                      onChange(role.id);
                      setOpen(false);
                      setSearch("");
                    }}
                    className={`w-full flex items-center gap-3 px-2 py-2 rounded-lg text-left transition-colors ${
                      isSelected ? "bg-primary/10" : "hover:bg-muted/60"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors ${
                        isSelected
                          ? "bg-primary border-primary text-primary-foreground"
                          : "border-muted-foreground/30 bg-background"
                      }`}
                    >
                      {isSelected && <Check size={10} strokeWidth={3} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-xs font-semibold truncate ${isSelected ? "text-primary" : "text-foreground"}`}
                      >
                        {role.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground font-mono truncate mt-0.5">
                        {role.slug}
                      </p>
                    </div>
                    {role.isDefault && (
                      <div className="flex-shrink-0 ml-2">
                        <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                          Mặc định
                        </span>
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
