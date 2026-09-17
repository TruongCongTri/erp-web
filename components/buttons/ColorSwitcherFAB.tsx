"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Palette, X, Check } from "lucide-react";

interface ColorTheme {
  id: string;
  name: string;
  swatch: string;
  scale: {
    100: string;
    200: string;
    250: string;
    300: string;
    350: string;
    400: string;
    450: string;
    500: string;
  };
}

const COLOR_THEMES: ColorTheme[] = [
  {
    id: "green",
    name: "Xanh lá (Mặc định)",
    swatch: "rgb(45, 106, 79)",
    scale: {
      100: "rgb(209, 236, 220)",
      200: "rgb(148, 199, 172)",
      250: "rgb(100, 170, 133)",
      300: "rgb(64, 145, 100)",
      350: "rgb(45, 106, 79)",
      400: "rgb(27, 67, 50)",
      450: "rgb(18, 45, 34)",
      500: "rgb(9, 23, 17)",
    },
  },
  {
    id: "blue",
    name: "Xanh dương",
    swatch: "rgb(14, 88, 207)",
    scale: {
      100: "rgb(219, 234, 254)",
      200: "rgb(153, 194, 255)",
      250: "rgb(102, 163, 255)",
      300: "rgb(59, 130, 246)",
      350: "rgb(29, 111, 232)",
      400: "rgb(14, 88, 207)",
      450: "rgb(10, 61, 145)",
      500: "rgb(6, 35, 84)",
    },
  },
  {
    id: "violet",
    name: "Tím",
    swatch: "rgb(109, 40, 217)",
    scale: {
      100: "rgb(237, 233, 254)",
      200: "rgb(196, 181, 253)",
      250: "rgb(167, 139, 250)",
      300: "rgb(139, 92, 246)",
      350: "rgb(124, 58, 237)",
      400: "rgb(109, 40, 217)",
      450: "rgb(76, 29, 149)",
      500: "rgb(46, 16, 101)",
    },
  },
  {
    id: "rose",
    name: "Hồng đỏ",
    swatch: "rgb(225, 29, 72)",
    scale: {
      100: "rgb(255, 228, 230)",
      200: "rgb(254, 164, 177)",
      250: "rgb(251, 113, 133)",
      300: "rgb(244, 63, 94)",
      350: "rgb(225, 29, 72)",
      400: "rgb(190, 18, 60)",
      450: "rgb(136, 19, 55)",
      500: "rgb(76, 5, 25)",
    },
  },
  {
    id: "orange",
    name: "Cam",
    swatch: "rgb(234, 88, 12)",
    scale: {
      100: "rgb(255, 237, 213)",
      200: "rgb(254, 215, 170)",
      250: "rgb(253, 186, 116)",
      300: "rgb(251, 146, 60)",
      350: "rgb(249, 115, 22)",
      400: "rgb(234, 88, 12)",
      450: "rgb(154, 52, 18)",
      500: "rgb(67, 20, 7)",
    },
  },
  {
    id: "slate",
    name: "Xám đen",
    swatch: "rgb(51, 65, 85)",
    scale: {
      100: "rgb(226, 232, 240)",
      200: "rgb(188, 200, 218)",
      250: "rgb(148, 163, 184)",
      300: "rgb(100, 116, 139)",
      350: "rgb(71, 85, 105)",
      400: "rgb(51, 65, 85)",
      450: "rgb(30, 41, 59)",
      500: "rgb(15, 23, 42)",
    },
  },
];

const STORAGE_KEY = "constructerp-color-theme";

/**
 * Applies the selected theme to :root CSS variables.
 * Updates both --base-* scale AND all semantic color tokens
 * (--primary, --primary-light, --accent, --ring, --secondary, etc.)
 * so the entire app color scheme changes.
 */
function applyTheme(theme: ColorTheme) {
  const root = document.documentElement;

  // 1. Update the base color scale
  root.style.setProperty("--base-100", theme.scale[100]);
  root.style.setProperty("--base-200", theme.scale[200]);
  root.style.setProperty("--base-250", theme.scale[250]);
  root.style.setProperty("--base-300", theme.scale[300]);
  root.style.setProperty("--base-350", theme.scale[350]);
  root.style.setProperty("--base-400", theme.scale[400]);
  root.style.setProperty("--base-450", theme.scale[450]);
  root.style.setProperty("--base-500", theme.scale[500]);

  // 2. Map semantic tokens to the scale so the whole app re-colors
  //    --primary               → 350 (mid-dark, used for sidebar bg, buttons, links)
  //    --primary-light         → 300 (lighter variant)
  //    --primary-lighter       → 250 (even lighter)
  //    --primary-foreground    → always white (text on primary bg)
  //    --accent                → 300 (interactive highlights)
  //    --accent-foreground     → always white
  //    --ring                  → 350 (focus ring)
  //    --secondary             → 100 (soft tinted bg)
  //    --secondary-foreground  → 400 (text on secondary)
  //    --foreground            → 500 (darkest for body text)
  // root.style.setProperty("--primary", theme.scale[350]);
  root.style.setProperty("--primary", theme.scale[450]);
  root.style.setProperty("--primary-light", theme.scale[300]);
  root.style.setProperty("--primary-lighter", theme.scale[250]);
  root.style.setProperty("--primary-foreground", "#ffffff");
  root.style.setProperty("--accent", theme.scale[300]);
  root.style.setProperty("--accent-foreground", "#ffffff");
  // root.style.setProperty("--ring", theme.scale[350]);
  root.style.setProperty("--ring", theme.scale[450]);
  root.style.setProperty("--secondary", theme.scale[100]);
  root.style.setProperty("--secondary-foreground", theme.scale[400]);
  root.style.setProperty("--foreground", theme.scale[500]);
}

export default function ColorSwitcherFAB() {
  const [open, setOpen] = useState(false);
  const [activeTheme, setActiveTheme] = useState<string>("green");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const theme = COLOR_THEMES.find((t) => t.id === saved);
      if (theme) {
        setActiveTheme(theme.id);
        applyTheme(theme);
      }
    }
  }, []);

  const selectTheme = useCallback((theme: ColorTheme) => {
    setActiveTheme(theme.id);
    applyTheme(theme);
    localStorage.setItem(STORAGE_KEY, theme.id);
  }, []);

  const currentTheme =
    COLOR_THEMES.find((t) => t.id === activeTheme) ?? COLOR_THEMES[0];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Popover */}
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className="relative z-50 bg-card border border-border rounded-xl shadow-2xl p-4 w-64 slide-in-right"
            style={{ borderRadius: 0 }}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-bold text-foreground">
                  Màu giao diện
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Chọn bảng màu chủ đạo
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-6 h-6 flex items-center justify-center hover:bg-muted text-muted-foreground transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            {/* Color grid */}
            <div className="grid grid-cols-3 gap-2">
              {COLOR_THEMES.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => selectTheme(theme)}
                  className={`relative flex flex-col items-center gap-1.5 p-2 border-2 transition-all hover:scale-105 ${
                    activeTheme === theme.id
                      ? "border-foreground shadow-md"
                      : "border-transparent hover:border-border"
                  }`}
                  title={theme.name}
                >
                  {/* Color scale preview */}
                  <div className="flex gap-0.5 overflow-hidden w-full h-5">
                    {([100, 200, 300, 400, 500] as const).map((stop) => (
                      <div
                        key={stop}
                        className="flex-1 h-full"
                        style={{ backgroundColor: theme.scale[stop] }}
                      />
                    ))}
                  </div>
                  <span className="text-[9px] text-muted-foreground text-center leading-tight">
                    {theme.name.split(" ")[0]}
                  </span>
                  {activeTheme === theme.id && (
                    <div className="absolute top-1 right-1 w-4 h-4 bg-foreground flex items-center justify-center">
                      <Check size={9} className="text-card" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Current scale preview */}
            <div className="mt-3 pt-3 border-t border-border">
              <p className="text-[10px] text-muted-foreground mb-1.5 font-medium">
                Thang màu hiện tại
              </p>
              <div className="flex overflow-hidden h-6 border border-border">
                {([100, 200, 250, 300, 350, 400, 450, 500] as const).map(
                  (stop) => (
                    <div
                      key={stop}
                      className="flex-1 h-full"
                      style={{ backgroundColor: currentTheme.scale[stop] }}
                      title={`--base-${stop}`}
                    />
                  ),
                )}
              </div>
              <div className="flex justify-between mt-0.5">
                <span className="text-[9px] text-muted-foreground">100</span>
                <span className="text-[9px] text-muted-foreground">500</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* FAB button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95"
        style={{ backgroundColor: currentTheme.scale[400] }}
        title="Đổi màu giao diện"
      >
        <Palette size={20} className="text-white" />
      </button>
    </div>
  );
}
