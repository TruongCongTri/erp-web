/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import {
  Clock,
  Loader2,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  ExternalLink,
  RotateCcw,
  Users,
  Globe,
} from "lucide-react";

import ActionButton from "@/components/buttons/ActionButton";
import {
  AutomationJobStatus,
  AutomationPlatform,
  ScheduledAutomationJob,
  useGetAutomationJobsQuery,
  useRetryAutomationJobMutation,
} from "@/lib/store/publishingAutomationApiSlice";
import { AUTOMATION_CHANNELS_ENABLED } from "@/components/ats/publishing/AutomationChannelsPanel";

const AUTOMATION_RETRY_PERMISSIONS = [
  "publishing_automation:update:any",
  "publishing_automation:manage:any",
];

const PLATFORM_BADGE: Record<
  AutomationPlatform,
  { label: string; bg: string; text: string; icon: React.ReactNode }
> = {
  [AutomationPlatform.FACEBOOK_GROUP]: {
    label: "Facebook Group",
    bg: "bg-[#1877f2]/10",
    text: "text-[#1877f2]",
    icon: <Users size={11} />,
  },
  [AutomationPlatform.TOPCV]: {
    label: "TopCV",
    bg: "bg-[#00b14f]/10",
    text: "text-[#00b14f]",
    icon: <Globe size={11} />,
  },
  [AutomationPlatform.CAREERVIET]: {
    label: "CareerViet",
    bg: "bg-red-500/10",
    text: "text-red-600",
    icon: <Globe size={11} />,
  },
};

const STATUS_CONFIG: Record<
  AutomationJobStatus,
  { label: string; className: string; icon: React.ReactNode }
> = {
  [AutomationJobStatus.PENDING]: {
    label: "Đã lên lịch",
    className: "bg-slate-100 text-slate-700 border-slate-200",
    icon: <Clock size={11} />,
  },
  [AutomationJobStatus.PROCESSING]: {
    label: "Đang đăng bài...",
    className: "bg-amber-100 text-amber-700 border-amber-200",
    icon: <Loader2 size={11} className="animate-spin" />,
  },
  [AutomationJobStatus.SUCCESS]: {
    label: "Thành công",
    className: "bg-emerald-100 text-emerald-700 border-emerald-200",
    icon: <CheckCircle2 size={11} />,
  },
  [AutomationJobStatus.FAILED]: {
    label: "Thất bại",
    className: "bg-rose-100 text-rose-700 border-rose-200",
    icon: <XCircle size={11} />,
  },
  [AutomationJobStatus.CHECKPOINT_BLOCKED]: {
    label: "Tài khoản cần xác minh",
    className: "bg-orange-100 text-orange-800 border-orange-300",
    icon: <ShieldAlert size={11} />,
  },
};

function AutomationJobRow({
  job,
  isBusy,
  onRetry,
}: {
  job: ScheduledAutomationJob;
  isBusy: boolean;
  onRetry: (id: string) => Promise<any>;
}) {
  const platformCfg = PLATFORM_BADGE[job.platform];
  const statusCfg = STATUS_CONFIG[job.status];
  const canRetry =
    job.status === AutomationJobStatus.FAILED ||
    job.status === AutomationJobStatus.CHECKPOINT_BLOCKED;

  const destinationLabel =
    job.platform === AutomationPlatform.FACEBOOK_GROUP
      ? job.group?.name || "Nhóm Facebook"
      : job.targetDestination;

  return (
    <div className="p-3 rounded-lg border border-border bg-card space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <span
            className={`text-[9px] font-bold px-1.5 py-0.5 rounded inline-flex items-center gap-1 ${platformCfg.bg} ${platformCfg.text}`}
          >
            {platformCfg.icon} {platformCfg.label.toUpperCase()}
          </span>
          <p className="text-xs font-semibold text-foreground truncate mt-1">
            {destinationLabel}
          </p>
          <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
            {job.scheduledAt
              ? new Date(job.scheduledAt).toLocaleString("vi-VN")
              : "—"}
          </p>
        </div>
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 inline-flex items-center gap-1 ${statusCfg.className}`}
        >
          {statusCfg.icon} {statusCfg.label}
        </span>
      </div>

      {job.status === AutomationJobStatus.SUCCESS && job.publishedPostUrl && (
        <a
          href={job.publishedPostUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] text-primary hover:underline inline-flex items-center gap-1"
        >
          <ExternalLink size={11} /> Xem bài đăng
        </a>
      )}

      {job.status === AutomationJobStatus.FAILED && job.lastErrorMessage && (
        <p className="text-[11px] text-rose-600 bg-rose-50 border border-rose-200 rounded px-2 py-1">
          {job.lastErrorMessage}
        </p>
      )}

      {job.status === AutomationJobStatus.CHECKPOINT_BLOCKED && (
        <p className="text-[11px] text-orange-800 bg-orange-50 border border-orange-200 rounded px-2 py-1 font-medium">
          Tài khoản Facebook cần xác minh lại — liên hệ bộ phận vận hành
        </p>
      )}

      {canRetry && (
        <ActionButton
          variant="outline"
          className="text-[11px] h-7 px-2.5 inline-flex items-center gap-1"
          allowedPermissions={AUTOMATION_RETRY_PERMISSIONS}
          permissionBehavior="disable"
          disabled={isBusy || !AUTOMATION_CHANNELS_ENABLED}
          isLoading={isBusy}
          onAction={() => onRetry(job.id)}
          loadingMessage="Đang gửi lại yêu cầu đăng bài..."
          successMessage="Đã gửi lại yêu cầu đăng bài."
          errorMessage={(err: any) =>
            err?.data?.meta?.message ||
            err?.data?.message ||
            "Gửi lại thất bại."
          }
          tooltip={
            !AUTOMATION_CHANNELS_ENABLED
              ? "Tính năng đang phát triển"
              : job.status === AutomationJobStatus.CHECKPOINT_BLOCKED
                ? "Ops cần xác thực lại tài khoản Facebook trước — thử lại có thể vẫn thất bại cho tới khi đó."
                : undefined
          }
        >
          <RotateCcw size={11} /> Thử lại
        </ActionButton>
      )}
    </div>
  );
}

export default function AutomationJobStatusGrid({
  atsJobPostingId,
}: {
  atsJobPostingId: string;
}) {
  // Bật polling ~20s khi còn job đang chờ / đang xử lý, tắt khi mọi thứ đã ổn định
  const [pollingInterval, setPollingInterval] = React.useState(0);
  const { data, isLoading, isFetching } = useGetAutomationJobsQuery(
    { atsJobPostingId },
    {
      skip: !atsJobPostingId,
      pollingInterval,
    },
  );

  const jobs = data?.data || [];

  React.useEffect(() => {
    const hasActiveRows = jobs.some(
      (j) =>
        j.status === AutomationJobStatus.PENDING ||
        j.status === AutomationJobStatus.PROCESSING,
    );
    setPollingInterval(hasActiveRows ? 20000 : 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const [retryJob] = useRetryAutomationJobMutation();
  const [retryingId, setRetryingId] = React.useState<string | null>(null);

  const handleRetry = async (id: string) => {
    setRetryingId(id);
    try {
      return await retryJob(id).unwrap();
    } finally {
      setRetryingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 text-center text-[11px] text-muted-foreground border border-dashed border-border rounded-lg">
        <Loader2 size={16} className="animate-spin mx-auto mb-1" />
        Đang tải trạng thái kênh đăng tuyển tự động...
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="p-6 text-center border border-dashed border-border rounded-lg space-y-1">
        <p className="text-xs font-semibold text-foreground">
          Chưa có kênh nào được lên lịch
        </p>
        <p className="text-[11px] text-muted-foreground">
          Thêm kênh Facebook Group, TopCV hoặc CareerViet để bắt đầu.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {isFetching && (
        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
          <Loader2 size={10} className="animate-spin" /> Đang cập nhật...
        </p>
      )}
      {jobs.map((job) => (
        <AutomationJobRow
          key={job.id}
          job={job}
          isBusy={retryingId === job.id}
          onRetry={handleRetry}
        />
      ))}
    </div>
  );
}
