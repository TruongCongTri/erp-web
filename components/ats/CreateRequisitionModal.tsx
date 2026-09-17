// components/ats/CreateRequisitionModal.tsx
"use client";

import React, { useState } from "react";
import { useCreateRecruitmentRequestMutation } from "@/lib/store/atsApiSlice";
import { DepartmentSelect } from "@/components/departments/DepartmentSelect";
import { gooeyToast } from "@/components/ui/goey-toaster";

interface CreateRequisitionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateRequisitionModal: React.FC<CreateRequisitionModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [departmentId, setDepartmentId] = useState<string>("");
  const [rawRequestNote, setRawRequestNote] = useState<string>("");

  const [createRequest, { isLoading }] = useCreateRecruitmentRequestMutation();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!departmentId) {
      gooeyToast.error("Vui lòng chọn phòng ban tiếp nhận.");
      return;
    }

    if (!rawRequestNote.trim()) {
      gooeyToast.error("Vui lòng nhập nội dung tóm tắt nhu cầu tuyển dụng.");
      return;
    }

    try {
      // departmentId ở đây là UUID thật (vd: "4fa85f64-5717-4562-b3fc-2c963f66afa6")
      await createRequest({
        departmentId,
        rawRequestNote,
      }).unwrap();

      gooeyToast.success("Khởi tạo yêu cầu tuyển dụng thành công!");
      onClose();
    } catch (err: unknown) {
      const errorMsg =
        (err as { data?: { message?: string } })?.data?.message ||
        "Gửi yêu cầu thất bại";
      gooeyToast.error(errorMsg);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl dark:bg-neutral-900">
        <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
          Tạo yêu cầu tuyển dụng mới
        </h3>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Phòng ban tuyển dụng <span className="text-red-500">*</span>
            </label>
            <div className="mt-1">
              <DepartmentSelect
                value={departmentId}
                onChange={setDepartmentId}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Mô tả sơ bộ nhu cầu nhân sự{" "}
              <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              value={rawRequestNote}
              onChange={(e) => setRawRequestNote(e.target.value)}
              placeholder="VD: Cần tuyển 2 Kỹ sư kết cấu cấp Senior, ưu tiên có kinh nghiệm làm các dự án nhà xưởng công nghiệp..."
              className="mt-1 w-full rounded-md border border-neutral-300 p-2.5 text-sm dark:border-neutral-700 dark:bg-neutral-800"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? "Đang xử lý..." : "Gửi yêu cầu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
