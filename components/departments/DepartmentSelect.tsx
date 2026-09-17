// components/departments/DepartmentSelect.tsx
"use client";

import React from "react";
import { useGetDepartmentsQuery } from "@/lib/store/departmentApiSlice";

interface DepartmentSelectProps {
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  error?: string;
  className?: string;
}

export const DepartmentSelect: React.FC<DepartmentSelectProps> = ({
  value,
  onChange,
  disabled = false,
  placeholder = "-- Chọn phòng ban tiếp nhận --",
  error,
  className = "",
}) => {
  const { data, isLoading, isError } = useGetDepartmentsQuery({
    isActive: true,
    limit: 100, // Lấy toàn bộ danh sách active phòng ban
    sortBy: "name",
    sortOrder: "ASC",
  });

  const departments = data?.data || [];

  return (
    <div className="w-full space-y-1">
      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled || isLoading}
        className={`w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 ${
          error ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
        } ${className}`}
      >
        <option value="" disabled>
          {isLoading ? "Đang tải danh sách phòng ban..." : placeholder}
        </option>

        {departments.map((dept) => (
          <option key={dept.id} value={dept.id}>
            [{dept.code}] {dept.name}
          </option>
        ))}
      </select>

      {isError && (
        <p className="text-xs text-red-500">
          Không thể tải danh mục phòng ban. Vui lòng thử lại.
        </p>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};
