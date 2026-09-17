"use client";
import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getLunarDate } from "@dqcai/vn-lunar";

type ViewState = "days" | "months" | "years";

interface GridCalendarProps {
  selectedDate?: Date;
  onSelect?: (date: Date) => void;
}

const WEEKDAYS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
const MONTHS = [
  "Tháng 1",
  "Tháng 2",
  "Tháng 3",
  "Tháng 4",
  "Tháng 5",
  "Tháng 6",
  "Tháng 7",
  "Tháng 8",
  "Tháng 9",
  "Tháng 10",
  "Tháng 11",
  "Tháng 12",
];

export function GridCalendar({ selectedDate, onSelect }: GridCalendarProps) {
  const [navDate, setNavDate] = useState(selectedDate || new Date());
  const [view, setView] = useState<ViewState>("days");

  const year = navDate.getFullYear();
  const month = navDate.getMonth();

  // Navigation Handlers
  const handlePrev = () => {
    if (view === "days") setNavDate(new Date(year, month - 1, 1));
    if (view === "months") setNavDate(new Date(year - 1, month, 1));
    if (view === "years") setNavDate(new Date(year - 10, month, 1));
  };

  const handleNext = () => {
    if (view === "days") setNavDate(new Date(year, month + 1, 1));
    if (view === "months") setNavDate(new Date(year + 1, month, 1));
    if (view === "years") setNavDate(new Date(year + 10, month, 1));
  };

  const handleHeaderClick = () => {
    if (view === "days") setView("months");
    if (view === "months") setView("years");
  };

  // --- DAYS VIEW LOGIC ---
  const renderDays = () => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sunday
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days = [];

    // Previous Month padding
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      days.push({
        day: daysInPrevMonth - i,
        isCurrentMonth: false,
        realMonth: month - 1,
      });
    }
    // Current Month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i, isCurrentMonth: true, realMonth: month });
    }
    // Next Month padding to complete the grid (42 cells = 6 weeks)
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({ day: i, isCurrentMonth: false, realMonth: month + 1 });
    }

    return (
      <>
        <div className="grid grid-cols-7 mb-2">
          {WEEKDAYS.map((wd) => (
            <div
              key={wd}
              className="text-center text-[11px] font-medium text-muted-foreground pb-1"
            >
              {wd}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((d, idx) => {
            const targetDate = new Date(year, d.realMonth, d.day);
            const isSelected =
              selectedDate?.toDateString() === targetDate.toDateString();
            const isToday =
              new Date().toDateString() === targetDate.toDateString();

            // @dqcai/vn-lunar Calculation (GMT+7 for Vietnam)
            const lunar = getLunarDate(
              targetDate.getDate(),
              targetDate.getMonth() + 1,
              targetDate.getFullYear(),
            );

            const displayLunar =
              lunar.day === 1 ? `${lunar.day}/${lunar.month}` : lunar.day;
              
            return (
              <button
                key={idx}
                onClick={() => {
                  onSelect?.(targetDate);
                  setNavDate(targetDate);
                }}
                className={`relative flex items-center justify-center w-10 h-10 rounded-md transition-colors ${
                  !d.isCurrentMonth
                    ? "text-muted-foreground/30 hover:bg-muted"
                    : isSelected
                      ? "bg-primary text-primary-foreground font-bold shadow-md"
                      : isToday
                        ? "bg-accent text-accent-foreground font-bold"
                        : "hover:bg-muted text-foreground"
                }`}
              >
                {/* Centered Solar Day */}
                <span className="text-sm">{d.day}</span>

                {/* Bottom-Right Lunar Day */}
                <span
                  className={`text-[9px] absolute bottom-1 right-1 leading-none ${
                    isSelected
                      ? "text-primary-foreground/80"
                      : "text-muted-foreground/60"
                  }`}
                >
                  {displayLunar}
                </span>
              </button>
            );
          })}
        </div>
      </>
    );
  };

  // --- MONTHS VIEW LOGIC ---
  const renderMonths = () => (
    <div className="grid grid-cols-3 gap-2 py-2">
      {MONTHS.map((m, idx) => (
        <button
          key={m}
          onClick={() => {
            setNavDate(new Date(year, idx, 1));
            setView("days");
          }}
          className={`flex items-center justify-center h-14 rounded-md text-sm transition-colors ${
            selectedDate?.getMonth() === idx &&
            selectedDate?.getFullYear() === year
              ? "bg-primary text-primary-foreground font-semibold shadow-md"
              : "hover:bg-muted text-foreground"
          }`}
        >
          {m}
        </button>
      ))}
    </div>
  );

  // --- YEARS VIEW LOGIC ---
  const renderYears = () => {
    const startDecade = Math.floor(year / 10) * 10;
    const years = Array.from({ length: 12 }, (_, i) => startDecade - 1 + i);

    return (
      <div className="grid grid-cols-3 gap-2 py-2">
        {years.map((y) => (
          <button
            key={y}
            onClick={() => {
              setNavDate(new Date(y, month, 1));
              setView("months");
            }}
            className={`flex items-center justify-center h-14 rounded-md text-sm transition-colors ${
              y < startDecade || y >= startDecade + 10
                ? "text-muted-foreground/40"
                : selectedDate?.getFullYear() === y
                  ? "bg-primary text-primary-foreground font-semibold shadow-md"
                  : "hover:bg-muted text-foreground"
            }`}
          >
            {y}
          </button>
        ))}
      </div>
    );
  };

  // Dynamic Header Title
  let headerTitle = "";
  if (view === "days") headerTitle = `Tháng ${month + 1}, ${year}`;
  if (view === "months") headerTitle = `${year}`;
  if (view === "years") {
    const startDecade = Math.floor(year / 10) * 10;
    headerTitle = `${startDecade} - ${startDecade + 9}`;
  }

  return (
    <div className="p-3 w-[304px] bg-card rounded-lg">
      <div className="flex items-center justify-between mb-4 px-1">
        <button
          onClick={handlePrev}
          className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground"
        >
          <ChevronLeft size={16} />
        </button>

        <button
          onClick={handleHeaderClick}
          disabled={view === "years"}
          className="text-sm font-semibold hover:bg-muted px-3 py-1.5 rounded-md transition-colors"
        >
          {headerTitle}
        </button>

        <button
          onClick={handleNext}
          className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {view === "days" && renderDays()}
      {view === "months" && renderMonths()}
      {view === "years" && renderYears()}
    </div>
  );
}
