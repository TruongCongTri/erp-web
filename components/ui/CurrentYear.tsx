"use client";

import { useEffect, useState } from "react";

export default function CurrentYear() {
  const [year, setYear] = useState<number | null>(null);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  // Avoid hydration mismatch by rendering nothing (or a fallback) until mounted
  if (!year) {
    return <span>2026</span>; // Standard fallback while hydrating
  }

  return <span>{year}</span>;
}
