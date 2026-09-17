"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  useCallback,
} from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";
import ActionButton, {
  ActionButtonProps,
} from "@/components/buttons/ActionButton";

// Hook layout effect an toàn cho SSR trong Next.js
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export interface DropdownActionItem extends Omit<
  ActionButtonProps,
  "className"
> {
  key?: string | number;
  label: React.ReactNode;
  icon?: React.ReactNode;
  danger?: boolean;
  className?: string;
  closeOnClick?: boolean;
}

export interface DropdownActionButtonProps {
  label: React.ReactNode;
  icon?: React.ReactNode;
  variant?: ActionButtonProps["variant"];
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  isLoading?: boolean;
  onPrimaryAction?: () => void | Promise<unknown>;
  actions?: DropdownActionItem[];
  children?: React.ReactNode;
  align?: "start" | "end";
  className?: string;
  menuClassName?: string;
}

interface Coords {
  top: number;
  left?: number;
  right?: number;
  placement: "bottom" | "top";
}

export function DropdownActionButton({
  label,
  icon,
  variant = "primary",
  disabled = false,
  isLoading = false,
  onPrimaryAction,
  actions = [],
  children,
  align = "end",
  className = "",
  menuClassName = "",
}: DropdownActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  // Khởi tạo coords là null thay vì top: 0 để không bao giờ render ở đỉnh màn hình
  const [coords, setCoords] = useState<Coords | null>(null);

  const triggerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Hàm tính tọa độ tức thời
  const calculatePosition = useCallback((): Coords | null => {
    if (!triggerRef.current) return null;

    const rect = triggerRef.current.getBoundingClientRect();
    const estimatedHeight = 260;
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    const shouldFlip = spaceBelow < estimatedHeight && spaceAbove > spaceBelow;

    return {
      top: shouldFlip ? rect.top - 6 : rect.bottom + 6,
      left: align === "start" ? Math.max(8, rect.left) : undefined,
      right:
        align === "end"
          ? Math.max(8, window.innerWidth - rect.right)
          : undefined,
      placement: shouldFlip ? "top" : "bottom",
    };
  }, [align]);

  const updatePosition = useCallback(() => {
    const nextCoords = calculatePosition();
    if (nextCoords) {
      setCoords(nextCoords);
    }
  }, [calculatePosition]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        triggerRef.current &&
        !triggerRef.current.contains(target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Dùng useLayoutEffect để tính toán vị trí TRƯỚC KHI trình duyệt vẽ frame đầu tiên
  useIsomorphicLayoutEffect(() => {
    if (!isOpen) {
      setCoords(null);
      return;
    }

    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, updatePosition]);

  // Tính tọa độ ĐỒNG BỘ ngay lúc click để React batching cùng lúc với setIsOpen
  const toggleDropdown = () => {
    if (!disabled && !isLoading) {
      if (!isOpen) {
        const nextCoords = calculatePosition();
        if (nextCoords) setCoords(nextCoords);
      }
      setIsOpen((prev) => !prev);
    }
  };

  const isSplit = Boolean(onPrimaryAction);

  // Chỉ mount Portal khi ĐÃ CÓ tọa độ thực tế (coords !== null)
  const dropdownContent =
    mounted && isOpen && coords
      ? createPortal(
          <div
            ref={dropdownRef}
            style={{
              position: "fixed",
              top: `${coords.top}px`,
              left: coords.left !== undefined ? `${coords.left}px` : undefined,
              right:
                coords.right !== undefined ? `${coords.right}px` : undefined,
              transform:
                coords.placement === "top" ? "translateY(-100%)" : undefined,
              transformOrigin:
                coords.placement === "top"
                  ? align === "end"
                    ? "bottom right"
                    : "bottom left"
                  : align === "end"
                    ? "top right"
                    : "top left",
              maxHeight: "calc(100vh - 32px)",
              // CẤM tuyệt đối transition trên top/left/right để triệt tiêu hiệu ứng bay
              transitionProperty: "opacity, transform",
            }}
            className={`z-[99999] min-w-[220px] max-w-[calc(100vw-24px)] p-1.5 bg-card text-card-foreground border border-border rounded-xl shadow-2xl overflow-y-auto custom-scrollbar animate-in fade-in-0 zoom-in-95 duration-100 flex flex-col gap-1 ${menuClassName}`}
          >
            {actions.map((item, index) => {
              const {
                key,
                label: itemLabel,
                icon: itemIcon,
                danger,
                className: itemClassName = "",
                closeOnClick = true,
                onAction,
                onClick,
                requireConfirm,
                ...restProps
              } = item;

              return (
                <ActionButton
                  key={key ?? index}
                  variant="ghost"
                  requireConfirm={requireConfirm}
                  {...restProps}
                  className={`!w-full !justify-start !h-auto !py-2.5 !px-3 !text-xs !font-medium rounded-lg transition-colors text-left ${
                    danger
                      ? "!text-red-600 hover:!bg-red-50 dark:hover:!bg-red-950/30"
                      : "text-foreground hover:bg-muted"
                  } ${itemClassName}`}
                  onAction={
                    onAction
                      ? async () => {
                          try {
                            return await onAction();
                          } finally {
                            if (closeOnClick) setIsOpen(false);
                          }
                        }
                      : undefined
                  }
                  onClick={(e) => {
                    if (onClick) onClick(e);
                    if (!onAction && !requireConfirm && closeOnClick) {
                      setIsOpen(false);
                    }
                  }}
                >
                  {itemIcon && (
                    <span className="mr-2.5 shrink-0">{itemIcon}</span>
                  )}
                  <div className="min-w-0 flex-1">{itemLabel}</div>
                </ActionButton>
              );
            })}

            {children && (
              <div className="flex flex-col gap-1 w-full">{children}</div>
            )}
          </div>,
          document.body,
        )
      : null;

  return (
    <div
      ref={triggerRef}
      className={`relative inline-flex items-center rounded-lg shadow-sm ${className}`}
    >
      {isSplit ? (
        <div className="inline-flex rounded-lg overflow-hidden border border-transparent">
          <ActionButton
            variant={variant}
            disabled={disabled}
            isLoading={isLoading}
            onAction={onPrimaryAction}
            className="!rounded-r-none !h-8 !px-3 !text-xs border-r border-white/20 dark:border-black/20"
          >
            {icon && <span className="mr-1.5">{icon}</span>}
            {label}
          </ActionButton>

          <button
            type="button"
            disabled={disabled || isLoading}
            onClick={toggleDropdown}
            className={`px-2 flex items-center justify-center transition-colors cursor-pointer ${
              variant === "primary"
                ? "btn-primary !rounded-l-none !border-l-0"
                : variant === "secondary"
                  ? "btn-secondary !rounded-l-none !border-l-0"
                  : variant === "outline"
                    ? "btn-outline !rounded-l-none !border-l-0"
                    : "btn-ghost !rounded-l-none"
            }`}
          >
            <ChevronDown
              size={13}
              className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
            />
          </button>
        </div>
      ) : (
        <ActionButton
          variant={variant}
          disabled={disabled}
          isLoading={isLoading}
          onClick={toggleDropdown}
          className="!h-8 !px-3.5 !text-xs flex items-center gap-1.5 cursor-pointer"
        >
          {icon && <span>{icon}</span>}
          <span>{label}</span>
          <ChevronDown
            size={13}
            className={`ml-1 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          />
        </ActionButton>
      )}

      {dropdownContent}
    </div>
  );
}
