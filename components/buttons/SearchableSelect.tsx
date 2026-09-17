"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  useMemo,
  useCallback,
  useSyncExternalStore,
} from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Search, Check, X } from "lucide-react";

// Hook layout effect an toàn cho môi trường SSR / Next.js
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

// Hàm subscribe rỗng dùng cho useSyncExternalStore để kiểm tra client-mount an toàn
const emptySubscribe = () => () => {};

export interface SelectOption<T = string | number> {
  value: T;
  label: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  description?: string;
}

export interface SearchableSelectProps<T = string | number> {
  options: SelectOption<T>[];
  value?: T | null;
  onChange: (value: T | null) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  isClearable?: boolean;
  className?: string;
  error?: string;
}

interface Coords {
  top: number;
  left: number;
  width: number;
  placement: "bottom" | "top";
}

export function SearchableSelect<T extends string | number>({
  options,
  value,
  onChange,
  placeholder = "Chọn một mục...",
  searchPlaceholder = "Tìm kiếm...",
  disabled = false,
  isClearable = false,
  className = "",
  error,
}: SearchableSelectProps<T>) {
  // 1. KIỂM TRA MOUNT BẰNG useSyncExternalStore (Không dùng useEffect + setState để tránh cascading renders)
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  // 2. CÁC STATE CƠ BẢN
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [coords, setCoords] = useState<Coords | null>(null);

  // 3. REFS
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // 4. DERIVED / MEMOIZED VALUES (ĐƯA LÊN ĐẦU COMPONENT TRƯỚC KHI CÁC HÀM KHÁC SỬ DỤNG)
  const selectedOption = useMemo(
    () => options.find((opt) => opt.value === value) ?? null,
    [options, value],
  );

  const filteredOptions = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return options;
    return options.filter((opt) => {
      const labelMatch = opt.label.toLowerCase().includes(query);
      const descMatch = opt.description
        ? opt.description.toLowerCase().includes(query)
        : false;
      return labelMatch || descMatch;
    });
  }, [options, searchTerm]);

  // 5. CALLBACKS VỊ TRÍ & ĐIỀU HƯỚNG
  const calculatePosition = useCallback((): Coords | null => {
    if (!containerRef.current) return null;

    const rect = containerRef.current.getBoundingClientRect();
    const estimatedHeight = 270;
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    const shouldFlip = spaceBelow < estimatedHeight && spaceAbove > spaceBelow;

    return {
      left: rect.left,
      width: rect.width,
      top: shouldFlip ? rect.top - 6 : rect.bottom + 6,
      placement: shouldFlip ? "top" : "bottom",
    };
  }, []);

  const updatePosition = useCallback(() => {
    const nextCoords = calculatePosition();
    if (nextCoords) setCoords(nextCoords);
  }, [calculatePosition]);

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
    setCoords(null);
    setSearchTerm("");
    setHighlightedIndex(-1);
  }, []);

  // 6. SỰ KIỆN CLICK NGOÀI
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isInsideTrigger = containerRef.current?.contains(target);
      const isInsideDropdown = dropdownRef.current?.contains(target);

      if (!isInsideTrigger && !isInsideDropdown) {
        closeDropdown();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, closeDropdown]);

  // 7. CẬP NHẬT VỊ TRÍ & FOCUS (Không gọi setState đồng bộ bên trong effect)
  useIsomorphicLayoutEffect(() => {
    if (!isOpen) return;

    updatePosition();
    const timer = setTimeout(() => searchInputRef.current?.focus(), 20);

    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isOpen, updatePosition]);

  // 8. TỰ ĐỘNG CUỘN THEO PHÍM MŨI TÊN
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const activeElement = listRef.current.children[
        highlightedIndex
      ] as HTMLElement;
      activeElement?.scrollIntoView({ block: "nearest" });
    }
  }, [highlightedIndex]);

  // 9. EVENT HANDLERS
  const handleSelect = (option: SelectOption<T>) => {
    if (option.disabled) return;
    onChange(option.value);
    closeDropdown();
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
  };

  const handleTriggerClick = () => {
    if (disabled) return;
    if (!isOpen) {
      const nextCoords = calculatePosition();
      if (nextCoords) setCoords(nextCoords);
      setIsOpen(true);
    } else {
      closeDropdown();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === "Enter" || e.key === "ArrowDown" || e.key === " ") {
        e.preventDefault();
        const nextCoords = calculatePosition();
        if (nextCoords) setCoords(nextCoords);
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredOptions.length - 1 ? prev + 1 : 0,
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredOptions.length - 1,
        );
        break;
      case "Enter":
        e.preventDefault();
        if (
          highlightedIndex >= 0 &&
          highlightedIndex < filteredOptions.length
        ) {
          handleSelect(filteredOptions[highlightedIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        closeDropdown();
        break;
    }
  };

  // 10. FLOATING PORTAL DROPDOWN
  const dropdownElement =
    isMounted && isOpen && coords
      ? createPortal(
          <div
            ref={dropdownRef}
            style={{
              position: "fixed",
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              width: `${coords.width}px`,
              transform:
                coords.placement === "top" ? "translateY(-100%)" : undefined,
              transformOrigin:
                coords.placement === "top" ? "bottom center" : "top center",
              transitionProperty: "opacity, transform",
            }}
            className="z-[99999] bg-background text-popover-foreground border border-border rounded-lg shadow-2xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-100"
          >
            <div className="p-2 border-b border-border bg-muted/20">
              <div className="relative">
                <Search
                  size={13}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setHighlightedIndex(-1);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder={searchPlaceholder}
                  className="w-full pl-7 pr-2.5 py-1.5 text-xs bg-background border border-border rounded-md outline-none focus:border-primary placeholder:text-muted-foreground/60"
                />
              </div>
            </div>

            <ul
              ref={listRef}
              role="listbox"
              className="max-h-56 overflow-y-auto p-1 text-xs custom-scrollbar"
            >
              {filteredOptions.length === 0 ? (
                <li className="px-3 py-4 text-center text-muted-foreground italic">
                  Không tìm thấy kết quả
                </li>
              ) : (
                filteredOptions.map((opt, index) => {
                  const isSelected = opt.value === value;
                  const isHighlighted = index === highlightedIndex;

                  return (
                    <li
                      key={String(opt.value)}
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => handleSelect(opt)}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      className={`flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-md cursor-pointer select-none transition-colors ${
                        opt.disabled
                          ? "opacity-40 cursor-not-allowed pointer-events-none"
                          : isHighlighted
                            ? "bg-accent text-accent-foreground"
                            : "hover:bg-muted"
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        {opt.icon && (
                          <span className="text-muted-foreground shrink-0">
                            {opt.icon}
                          </span>
                        )}
                        <div className="min-w-0">
                          <p
                            className={`truncate ${
                              isSelected
                                ? "font-semibold text-primary"
                                : "text-foreground"
                            }`}
                          >
                            {opt.label}
                          </p>
                          {opt.description && (
                            <p className="text-[10px] text-muted-foreground truncate">
                              {opt.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {isSelected && (
                        <Check
                          size={14}
                          className="text-primary shrink-0 ml-2"
                        />
                      )}
                    </li>
                  );
                })
              )}
            </ul>
          </div>,
          document.body,
        )
      : null;

  return (
    <div className={`relative w-full ${className}`} ref={containerRef}>
      <div
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        tabIndex={disabled ? -1 : 0}
        onClick={handleTriggerClick}
        onKeyDown={handleKeyDown}
        className={`flex items-center justify-between gap-2 px-3 py-2 min-h-[38px] text-xs bg-background border rounded-lg transition-colors cursor-pointer select-none outline-none focus:ring-1 focus:ring-primary focus:border-primary ${
          disabled
            ? "opacity-50 cursor-not-allowed bg-muted"
            : "hover:border-primary/50"
        } ${error ? "border-red-500 ring-1 ring-red-500" : "border-border"}`}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {selectedOption?.icon && (
            <span className="text-muted-foreground shrink-0">
              {selectedOption.icon}
            </span>
          )}
          <span
            className={`truncate ${
              selectedOption
                ? "text-foreground font-medium"
                : "text-muted-foreground"
            }`}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0 text-muted-foreground">
          {isClearable && selectedOption && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-0.5 rounded hover:bg-muted hover:text-foreground transition-colors"
            >
              <X size={13} />
            </button>
          )}
          <ChevronDown
            size={14}
            className={`transition-transform duration-200 ${
              isOpen ? "rotate-180 text-primary" : ""
            }`}
          />
        </div>
      </div>

      {error && (
        <p className="mt-1 text-[11px] text-red-500 font-medium">{error}</p>
      )}

      {dropdownElement}
    </div>
  );
}
