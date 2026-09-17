"use client";

import {
  Trash2,
  Save,
  Send,
  Wrench,
  AlertCircle,
  Building2,
  Laptop,
  Shield,
  Edit,
  Copy,
  FileDown,
} from "lucide-react";
import ActionButton from "@/components/buttons/ActionButton";
import {
  SearchableSelect,
  SelectOption,
} from "@/components/buttons/SearchableSelect";
import { useState } from "react";
import { DropdownActionButton } from "@/components/buttons/DropdownActionButton";
const DEPARTMENT_OPTIONS: SelectOption<string>[] = [
  {
    value: "MEP",
    label: "Cơ điện (MEP)",
    icon: <Wrench size={13} />,
    description: "Hệ thống điện, cấp thoát nước, HVAC",
  },
  {
    value: "STRUCTURAL",
    label: "Kết cấu (Structure)",
    icon: <Building2 size={13} />,
    description: "Bê tông cốt thép, khung dầm",
  },
  {
    value: "IT",
    label: "Công nghệ thông tin",
    icon: <Laptop size={13} />,
    description: "Hệ thống ERP, hạ tầng mạng",
  },
  {
    value: "QA_QC",
    label: "Kiểm tra chất lượng (QA/QC)",
    icon: <Shield size={13} />,
    description: "Nghiệm thu vật tư và thi công",
  },
];
export default function ButtonDemoPage() {
  const [selectedDept, setSelectedDept] = useState<string | null>("MEP");
  // Simulated Async Actions
  const handleSave = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate API call
  };

  const handleDelete = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate API call
  };

  const handleError = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    throw new Error("Mất kết nối với máy chủ!"); // Throws a hard error
  };

  const handleWarning = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    // Throw an object with a custom type to trigger the warning toast
    throw {
      type: "warning",
      message: "Đã lưu một phần, nhưng file đính kèm bị lỗi.",
    };
  };

  const handleSaveDynamic = async () => {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return { itemName: "Bản vẽ Kết cấu V3" }; // Pass data to the success handler
  };

  const handleAPIError = async () => {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    throw new Error("Mã lỗi 503: Cổng kết nối thanh toán quá tải.");
  };

  return (
    <div className="p-8 space-y-8 max-w-2xl">
      <h2 className="text-xl font-bold">
        1. Nút "Đang phát triển" (Under Development)
      </h2>
      <div className="flex gap-4">
        {/* TEXT BUTTON */}
        <ActionButton isUnderDevelopment variant="secondary">
          <Wrench size={16} /> Báo cáo nâng cao
        </ActionButton>

        {/* ICON ONLY BUTTON */}
        <ActionButton
          isUnderDevelopment
          iconOnly
          variant="outline"
          title="Cài đặt tính năng"
        >
          <Wrench size={16} />
        </ActionButton>
      </div>

      <hr className="border-border" />

      <h2 className="text-xl font-bold">
        2. Nút kèm Xác nhận (Confirmation Popup)
      </h2>
      <div className="flex gap-4">
        <ActionButton
          variant="destructive"
          requireConfirm
          confirmTitle="Xóa dữ liệu?"
          confirmMessage="Hành động này không thể hoàn tác. Toàn bộ dữ liệu của nhân viên này sẽ bị xóa vĩnh viễn khỏi hệ thống."
          confirmLabel="Xóa ngay"
          onAction={handleDelete}
          successMessage="Đã xóa dữ liệu thành công!"
        >
          <Trash2 size={16} /> Xóa Nhân viên
        </ActionButton>

        {/* ICON ONLY WITH CONFIRM */}
        <ActionButton
          variant="ghost"
          iconOnly
          requireConfirm
          confirmTitle="Hủy thao tác?"
          onAction={handleDelete}
          className="text-red-500 hover:bg-red-50"
        >
          <Trash2 size={16} />
        </ActionButton>
      </div>

      <hr className="border-border" />

      <h2 className="text-xl font-bold">
        3. Xử lý Trạng thái Trả về (Success / Error / Warning)
      </h2>
      <div className="flex gap-4">
        {/* SUCCESS */}
        <ActionButton
          onAction={handleSave}
          successMessage="Lưu thiết lập thành công!"
        >
          <Save size={16} /> Lưu thay đổi
        </ActionButton>

        {/* ERROR */}
        <ActionButton variant="outline" onAction={handleError}>
          <AlertCircle size={16} className="text-red-500" /> Test Lỗi (Error)
        </ActionButton>

        {/* WARNING */}
        <ActionButton variant="outline" onAction={handleWarning}>
          <AlertCircle size={16} className="text-amber-500" /> Test Cảnh báo
          (Warning)
        </ActionButton>
      </div>

      <h2 className="text-xl font-bold">Thao tác Dynamic với toast.promise</h2>

      <div className="flex gap-4">
        {/* SUCCESS WITH DYNAMIC DATA */}
        {/* The toast will say "Loading..." -> then update to "Saved Bản vẽ Kết cấu V3 successfully!" */}
        <ActionButton
          onAction={handleSaveDynamic}
          loadingMessage="Đang đồng bộ dữ liệu..."
          successMessage={(data) => `Đã lưu "${data.itemName}" thành công!`}
        >
          <Save size={16} /> Lưu bản vẽ
        </ActionButton>

        {/* ERROR WITH DYNAMIC ERROR TEXT */}
        {/* The toast will say "Loading..." -> then turn red and display the exact API error */}
        <ActionButton
          variant="outline"
          onAction={handleAPIError}
          loadingMessage="Đang kết nối cổng thanh toán..."
          errorMessage={(err) => `Thất bại: ${err.message}`}
        >
          <AlertCircle size={16} className="text-red-500" /> Thanh toán
        </ActionButton>
      </div>
      <SearchableSelect
        options={DEPARTMENT_OPTIONS}
        value={selectedDept}
        onChange={(val) => setSelectedDept(val)}
        placeholder="Chọn một phòng ban..."
        searchPlaceholder="Tìm theo tên hoặc mô tả..."
        isClearable
      />
      <DropdownActionButton
        label="Xuất bản ngay"
        icon={<Send size={13} />}
        variant="primary"
        onPrimaryAction={() => console.log("Publish default action")}
        actions={[
          {
            label: "Xuất bản và hẹn giờ",
            icon: <Send size={13} />,
            onAction: () => console.log("Schedule publish"),
          },
          {
            label: "Xuất dữ liệu Excel",
            icon: <FileDown size={13} />,
            onAction: () => console.log("Export Excel"),
          },
          {
            label: "Xóa bản nháp",
            icon: <Trash2 size={13} />,
            danger: true,
            requireConfirm: true,
            confirmTitle: "Xác nhận xóa?",
            onAction: () => console.log("Deleted"),
          },
        ]}
      />

      {/* Mode 2: Unified Button with custom ActionButton children */}
      <DropdownActionButton
        label="Thao tác khác"
        variant="outline"
        align="start"
      >
        <ActionButton
          variant="ghost"
          className="!w-full !justify-start !h-8 !text-xs"
          onAction={() => console.log("Edit clicked")}
        >
          <Edit size={13} className="mr-2" /> Chỉnh sửa nhanh
        </ActionButton>
        <ActionButton
          variant="ghost"
          className="!w-full !justify-start !h-8 !text-xs"
          onAction={() => console.log("Copy link clicked")}
        >
          <Copy size={13} className="mr-2" /> Sao chép liên kết
        </ActionButton>
      </DropdownActionButton>
    </div>
  );
}
