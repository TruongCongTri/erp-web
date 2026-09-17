"use client";

import * as React from "react";
import { cn } from "@/lib/utils"; // Đảm bảo import cn từ đúng thư mục của bạn
import {
  DayPicker,
  getDefaultClassNames,
  type DayButton,
  type Locale,
} from "react-day-picker";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  locale,
  formatters,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>["variant"];
}) {
  const defaultClassNames = getDefaultClassNames();

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "group/calendar p-3 bg-card text-foreground rounded-xl",
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className,
      )}
      captionLayout={captionLayout}
      locale={locale}
      formatters={{
        formatMonthDropdown: (date) =>
          date.toLocaleString(locale?.code, { month: "short" }),
        ...formatters,
      }}
      classNames={{
        root: cn("w-fit", defaultClassNames.root),
        months: cn(
          "relative flex flex-col gap-4 sm:flex-row",
          defaultClassNames.months,
        ),
        month: cn("flex w-full flex-col", defaultClassNames.month),

        // ── Kéo các nút Nav xuống ngang hàng với Label và căn chỉnh margin
        nav: cn(
          "absolute inset-x-0 top-0 flex w-full items-center justify-between px-2 pt-2",
          defaultClassNames.nav,
        ),
        button_previous: cn(
          "flex items-center justify-center h-7 w-7 rounded border border-border/50 bg-background text-muted-foreground hover:bg-muted hover:text-foreground transition-colors z-10",
          defaultClassNames.button_previous,
        ),
        button_next: cn(
          "flex items-center justify-center h-7 w-7 rounded border border-border/50 bg-background text-muted-foreground hover:bg-muted hover:text-foreground transition-colors z-10",
          defaultClassNames.button_next,
        ),

        // ── Header Tháng/Năm mang phong cách FacetFilter Header
        month_caption: cn(
          "flex h-10 w-full items-center justify-center mb-2 border-b border-border/50 pb-2",
          defaultClassNames.month_caption,
        ),
        caption_label: cn(
          "text-sm font-bold text-foreground",
          defaultClassNames.caption_label,
        ),

        // ── Dropdowns
        dropdowns: cn(
          "flex items-center justify-center gap-1.5 text-sm font-bold",
          defaultClassNames.dropdowns,
        ),
        dropdown_root: cn(
          "relative rounded-md",
          defaultClassNames.dropdown_root,
        ),
        dropdown: cn(
          "absolute inset-0 bg-popover opacity-0",
          defaultClassNames.dropdown,
        ),

        // ── Khung ngày tháng
        month_grid: cn("w-full border-collapse", defaultClassNames.month_grid),
        weekdays: cn("flex pb-2", defaultClassNames.weekdays),
        weekday: cn(
          "flex-1 flex items-center justify-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground",
          defaultClassNames.weekday,
        ),
        week: cn("mt-1 flex w-full", defaultClassNames.week),

        // ── Reset thuộc tính Day base
        day: cn(
          "relative p-0 text-center focus-within:relative focus-within:z-20",
          defaultClassNames.day,
        ),
        outside: cn(
          "text-muted-foreground opacity-50",
          defaultClassNames.outside,
        ),
        disabled: cn(
          "text-muted-foreground opacity-30",
          defaultClassNames.disabled,
        ),

        ...classNames,
      }}
      components={{
        Root: ({ className, rootRef, ...props }) => (
          <div
            data-slot="calendar"
            ref={rootRef}
            className={cn(className)}
            {...props}
          />
        ),
        Chevron: ({ className, orientation, ...props }) => {
          if (orientation === "left")
            return (
              <ChevronLeft className={cn("size-4", className)} {...props} />
            );
          if (orientation === "right")
            return (
              <ChevronRight className={cn("size-4", className)} {...props} />
            );
          return <ChevronDown className={cn("size-4", className)} {...props} />;
        },
        DayButton: ({ ...props }) => (
          <CalendarDayButton locale={locale} {...props} />
        ),
        WeekNumber: ({ children, ...props }) => (
          <td {...props}>
            <div className="flex size-8 items-center justify-center text-center text-[10px] font-bold text-muted-foreground">
              {children}
            </div>
          </td>
        ),
        ...components,
      }}
      {...props}
    />
  );
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  locale,
  ...props
}: React.ComponentProps<typeof DayButton> & { locale?: Partial<Locale> }) {
  const ref = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);

  return (
    <Button
      ref={ref}
      variant="ghost"
      data-day={day.date.toLocaleDateString(locale?.code)}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      data-today={modifiers.today}
      className={cn(
        // Base Day Style (Khớp kích thước và font của List Item trong FacetFilter)
        "relative isolate flex h-8 w-8 items-center justify-center rounded-md text-xs font-medium border-0 transition-colors p-0",
        "hover:bg-muted hover:text-foreground",

        // Range Middle Style (Xóa bo góc, thêm background nhẹ)
        "data-[range-middle=true]:bg-primary/10 data-[range-middle=true]:text-primary data-[range-middle=true]:rounded-none data-[range-middle=true]:hover:bg-primary/20",

        // Range Start Style (Bo góc trái, không bo góc phải)
        "data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground data-[range-start=true]:rounded-l-md data-[range-start=true]:rounded-r-none data-[range-start=true]:hover:bg-primary/90",

        // Range End Style (Bo góc phải, không bo góc trái)
        "data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground data-[range-end=true]:rounded-r-md data-[range-end=true]:rounded-l-none data-[range-end=true]:hover:bg-primary/90",

        // Single Selected Day
        "data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground data-[selected-single=true]:rounded-md data-[selected-single=true]:shadow-sm data-[selected-single=true]:hover:bg-primary/90",

        // Today Style
        "data-[today=true]:text-primary data-[today=true]:font-bold data-[today=true]:bg-primary/5",

        className,
      )}
      {...props}
    />
  );
}

export { Calendar, CalendarDayButton };
