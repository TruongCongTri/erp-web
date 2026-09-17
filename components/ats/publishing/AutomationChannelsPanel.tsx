/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import {
  CheckSquare,
  Square,
  Users,
  Globe,
  Calendar,
  Clock,
  Timer,
  X,
  Link2,
  ChevronRight,
  Sparkles,
  RefreshCw,
  Lock,
} from "lucide-react";

import { gooeyToast } from "@/components/ui/goey-toaster";
import {
  AutomationPlatform,
  GroupRecommendation,
  useGetFacebookGroupRecommendationsMutation,
  useDistributeFacebookGroupsMutation,
  useCreateAutomationJobMutation,
  useCreateFacebookGroupMutation,
} from "@/lib/store/publishingAutomationApiSlice";

function guessGroupNameFromUrl(url: string): string {
  try {
    const path = url
      .replace(/^https?:\/\//, "")
      .split("?")[0]
      .split("/")
      .filter(Boolean);
    const last = path[path.length - 1] || "";
    return decodeURIComponent(last)
      .replace(/[-_]+/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  } catch {
    return "";
  }
}

function getErrorMessage(err: any, fallback: string): string {
  const msg = err?.data?.meta?.message || err?.data?.message || err?.message;
  if (Array.isArray(msg)) return msg.join(", ");
  return msg || fallback;
}

function pad2(n: number): string {
  return n.toString().padStart(2, "0");
}
function toDateInputValue(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}
function toTimeInputValue(d: Date): string {
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

function normalizeUrl(url: string): string {
  return url
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/+$/, "")
    .split("?")[0];
}

const JOB_BOARDS_CONFIG: Record<
  string,
  { label: string; badgeLabel: string; iconBg: string; storageKey: string }
> = {
  [AutomationPlatform.TOPCV]: {
    label: "TopCV Recruitment Partner",
    badgeLabel: "TopCV",
    iconBg: "bg-[#00b14f] text-white",
    storageKey: "publishingAutomation.targetDestination.TOPCV",
  },
  [AutomationPlatform.CAREERVIET]: {
    label: "CareerViet (CareerBuilder)",
    badgeLabel: "CareerViet",
    iconBg: "bg-red-600 text-white",
    storageKey: "publishingAutomation.targetDestination.CAREERVIET",
  },
};

/**
 * Temporary rollout flag: only "Publish to Company Website" is live right
 * now. Flip this back to true to re-enable Facebook Groups / TopCV /
 * CareerViet channel selection once the automation module is ready.
 */
export const AUTOMATION_CHANNELS_ENABLED = false;

type RailKey = "fbGroups" | "jobBoards";

export interface SubmitResult {
  label: string;
  ok: boolean;
  message?: string;
}

export interface AutomationChannelsPanelHandle {
  submit: () => Promise<SubmitResult[]>;
  getSelectionCount: () => number;
}

export interface AutomationChannelsPanelProps {
  atsJobId: string;
  jobTitle: string;
  jobDescription: string;
  jobType: string;
  requiredSkills?: string[];
  excludeGroupIds?: string[];
  excludePlatforms?: AutomationPlatform[];
  /** Extra static rows rendered above the FB Groups / Job Boards rows in the same rail column (e.g. LinkedIn, Facebook Page checkboxes). */
  leadingRail?: React.ReactNode;
  onSelectionCountChange?: (count: number) => void;
  onExpandedChange?: (expanded: boolean) => void;
}

const AutomationChannelsPanel = forwardRef<
  AutomationChannelsPanelHandle,
  AutomationChannelsPanelProps
>(function AutomationChannelsPanel(
  {
    atsJobId,
    jobTitle,
    jobDescription,
    jobType,
    requiredSkills = [],
    excludeGroupIds = [],
    excludePlatforms = [],
    leadingRail,
    onSelectionCountChange,
    onExpandedChange,
  },
  ref,
) {
  const [activeRail, setActiveRail] = useState<RailKey | null>(null);

  // ── FACEBOOK GROUPS ────────────────────────────────────────────────────────
  const [getRecommendations, { isLoading: isLoadingRecs }] =
    useGetFacebookGroupRecommendationsMutation();
  const [distributeGroups] = useDistributeFacebookGroupsMutation();

  const [recommendations, setRecommendations] = useState<
    GroupRecommendation[]
  >([]);
  const [hasFetchedRecs, setHasFetchedRecs] = useState(false);
  const [selectedGroups, setSelectedGroups] = useState<
    { id: string; name: string }[]
  >([]);
  const [pasteLink, setPasteLink] = useState("");
  const [pasteError, setPasteError] = useState<string | null>(null);
  const [pendingNewGroupUrl, setPendingNewGroupUrl] = useState<string | null>(
    null,
  );
  const [newGroupName, setNewGroupName] = useState("");
  const [createFacebookGroup, { isLoading: isCreatingGroup }] =
    useCreateFacebookGroupMutation();

  const now = React.useMemo(() => new Date(), []);
  const [targetDate, setTargetDate] = useState(() => toDateInputValue(now));
  const [windowStartTime, setWindowStartTime] = useState(() =>
    toTimeInputValue(new Date(now.getTime() + 15 * 60000)),
  );
  const [windowEndTime, setWindowEndTime] = useState(() =>
    toTimeInputValue(new Date(now.getTime() + 3 * 3600000)),
  );
  const [minBufferMinutes, setMinBufferMinutes] = useState(25);

  const fetchRecommendations = async () => {
    try {
      const res = await getRecommendations({
        jobTitle,
        jobType,
        requiredSkills,
        filterOnlyActiveMembers: true,
      }).unwrap();
      setRecommendations(res.data || []);
      setHasFetchedRecs(true);
    } catch (err: any) {
      gooeyToast.error(
        getErrorMessage(err, "Không thể tải gợi ý nhóm Facebook."),
      );
    }
  };

  useEffect(() => {
    if (!AUTOMATION_CHANNELS_ENABLED) return;
    fetchRecommendations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const visibleRecommendations = recommendations.filter(
    (r) =>
      !excludeGroupIds.includes(r.group.id) &&
      !selectedGroups.some((g) => g.id === r.group.id),
  );

  const addGroup = (id: string, name: string) => {
    setSelectedGroups((prev) =>
      prev.some((g) => g.id === id) ? prev : [...prev, { id, name }],
    );
  };
  const removeGroup = (id: string) => {
    setSelectedGroups((prev) => prev.filter((g) => g.id !== id));
  };

  const handleAddPastedLink = () => {
    const value = pasteLink.trim();
    if (!value) return;
    setPasteError(null);
    setPendingNewGroupUrl(null);

    const normalizedInput = normalizeUrl(value);
    const match = recommendations.find(
      (r) => r.group.url && normalizeUrl(r.group.url) === normalizedInput,
    );

    if (!match) {
      // Nhóm chưa có trong hệ thống — cho phép thêm mới ngay tại đây
      setPendingNewGroupUrl(value);
      setNewGroupName(guessGroupNameFromUrl(value));
      return;
    }
    if (excludeGroupIds.includes(match.group.id)) {
      setPasteError("Nhóm này đã được đăng bài hoặc đang chờ xử lý.");
      return;
    }
    addGroup(match.group.id, match.group.name);
    setPasteLink("");
  };

  const handleConfirmCreateGroup = async () => {
    if (!pendingNewGroupUrl) return;
    const name = newGroupName.trim();
    if (!name) {
      setPasteError("Vui lòng nhập tên nhóm.");
      return;
    }
    try {
      const res = await createFacebookGroup({
        name,
        url: pendingNewGroupUrl,
      }).unwrap();
      addGroup(res.data.id, res.data.name);
      gooeyToast.success(`Đã thêm nhóm "${res.data.name}" vào hệ thống.`);
      setPendingNewGroupUrl(null);
      setNewGroupName("");
      setPasteLink("");
      setPasteError(null);
    } catch (err: any) {
      gooeyToast.error(getErrorMessage(err, "Không thể thêm nhóm mới."));
    }
  };

  const handleCancelCreateGroup = () => {
    setPendingNewGroupUrl(null);
    setNewGroupName("");
  };

  // ── JOB BOARDS (TOPCV / CAREERVIET) ────────────────────────────────────────
  const [createAutomationJob] = useCreateAutomationJobMutation();
  const [jobBoards, setJobBoards] = useState<
    Record<string, { enabled: boolean; targetDestination: string }>
  >({
    [AutomationPlatform.TOPCV]: { enabled: false, targetDestination: "" },
    [AutomationPlatform.CAREERVIET]: { enabled: false, targetDestination: "" },
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    setJobBoards((prev) => {
      const next = { ...prev };
      Object.entries(JOB_BOARDS_CONFIG).forEach(([platform, cfg]) => {
        next[platform] = {
          ...next[platform],
          targetDestination:
            window.localStorage.getItem(cfg.storageKey) ||
            next[platform].targetDestination,
        };
      });
      return next;
    });
  }, []);

  const visibleJobBoardPlatforms = (
    [AutomationPlatform.TOPCV, AutomationPlatform.CAREERVIET] as const
  ).filter((p) => !excludePlatforms.includes(p));

  const toggleJobBoard = (platform: string) => {
    setJobBoards((prev) => ({
      ...prev,
      [platform]: { ...prev[platform], enabled: !prev[platform].enabled },
    }));
  };

  const setJobBoardDestination = (platform: string, value: string) => {
    setJobBoards((prev) => ({
      ...prev,
      [platform]: { ...prev[platform], targetDestination: value },
    }));
    const cfg = JOB_BOARDS_CONFIG[platform];
    if (typeof window !== "undefined" && cfg) {
      window.localStorage.setItem(cfg.storageKey, value);
    }
  };

  // ── SELECTION COUNT (số "kênh" đã cấu hình, hiển thị trên nút Phát hành) ────
  const jobBoardsSelectedCount = visibleJobBoardPlatforms.filter(
    (p) => jobBoards[p]?.enabled,
  ).length;
  const selectionCount = AUTOMATION_CHANNELS_ENABLED
    ? (selectedGroups.length > 0 ? 1 : 0) + jobBoardsSelectedCount
    : 0;

  useEffect(() => {
    onSelectionCountChange?.(selectionCount);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectionCount]);

  useEffect(() => {
    onExpandedChange?.(activeRail !== null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeRail]);

  // ── SUBMIT TỔNG HỢP (gọi từ nút Phát hành chính của modal cha) ─────────────
  useImperativeHandle(ref, () => ({
    getSelectionCount: () => selectionCount,
    submit: async () => {
      if (!AUTOMATION_CHANNELS_ENABLED) return [];
      const results: SubmitResult[] = [];

      if (selectedGroups.length > 0) {
        try {
          await distributeGroups({
            atsJobId,
            jobTitle,
            jobDescription,
            selectedGroupIds: selectedGroups.map((g) => g.id),
            targetDate,
            windowStartTime,
            windowEndTime,
            minBufferMinutes,
          }).unwrap();
          results.push({ label: "Nhóm Facebook", ok: true });
          setSelectedGroups([]);
        } catch (err: any) {
          results.push({
            label: "Nhóm Facebook",
            ok: false,
            message: getErrorMessage(err, "Lên lịch đăng bài thất bại."),
          });
        }
      }

      for (const platform of visibleJobBoardPlatforms) {
        const state = jobBoards[platform];
        if (!state?.enabled) continue;
        const cfg = JOB_BOARDS_CONFIG[platform];
        const targetDestination = state.targetDestination.trim();
        if (!targetDestination) {
          results.push({
            label: cfg.badgeLabel,
            ok: false,
            message: `Vui lòng nhập đường dẫn trang tuyển dụng cho ${cfg.badgeLabel}.`,
          });
          continue;
        }
        try {
          await createAutomationJob({
            atsJobId,
            platform: platform as
              | AutomationPlatform.TOPCV
              | AutomationPlatform.CAREERVIET,
            targetDestination,
            jobTitle,
            jobDescription,
          }).unwrap();
          results.push({ label: cfg.badgeLabel, ok: true });
        } catch (err: any) {
          results.push({
            label: cfg.badgeLabel,
            ok: false,
            message: getErrorMessage(
              err,
              `Đăng bài lên ${cfg.badgeLabel} thất bại.`,
            ),
          });
        }
      }

      return results;
    },
  }));

  return (
    <div className="flex gap-4">
      {/* ─── LEFT RAIL ─── */}
      <div className="w-[190px] shrink-0 space-y-1.5">
        {leadingRail}

        <button
          type="button"
          disabled={!AUTOMATION_CHANNELS_ENABLED}
          onClick={() =>
            setActiveRail((prev) => (prev === "fbGroups" ? null : "fbGroups"))
          }
          title={
            AUTOMATION_CHANNELS_ENABLED
              ? undefined
              : "Tính năng đang phát triển"
          }
          className={`w-full p-2.5 rounded-lg border transition-all flex items-center justify-between gap-2 text-left ${
            !AUTOMATION_CHANNELS_ENABLED
              ? "border-border bg-muted/30 opacity-60 cursor-not-allowed"
              : activeRail === "fbGroups"
                ? "border-primary bg-primary/[0.03] shadow-xs cursor-pointer"
                : "border-border bg-card hover:border-border/80 cursor-pointer"
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-md bg-[#1877f2] text-white flex items-center justify-center shrink-0">
              <Users size={12} />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-foreground truncate">
                Nhóm Facebook
              </p>
              {!AUTOMATION_CHANNELS_ENABLED ? (
                <p className="text-[10px] text-muted-foreground">
                  Đang phát triển
                </p>
              ) : (
                selectedGroups.length > 0 && (
                  <p className="text-[10px] text-primary font-semibold">
                    {selectedGroups.length} nhóm đã chọn
                  </p>
                )
              )}
            </div>
          </div>
          {!AUTOMATION_CHANNELS_ENABLED ? (
            <Lock size={13} className="shrink-0 text-muted-foreground" />
          ) : (
            <ChevronRight
              size={13}
              className={`shrink-0 text-muted-foreground transition-transform ${
                activeRail === "fbGroups" ? "rotate-90" : ""
              }`}
            />
          )}
        </button>

        {visibleJobBoardPlatforms.length > 0 && (
          <button
            type="button"
            disabled={!AUTOMATION_CHANNELS_ENABLED}
            onClick={() =>
              setActiveRail((prev) =>
                prev === "jobBoards" ? null : "jobBoards",
              )
            }
            title={
              AUTOMATION_CHANNELS_ENABLED
                ? undefined
                : "Tính năng đang phát triển"
            }
            className={`w-full p-2.5 rounded-lg border transition-all flex items-center justify-between gap-2 text-left ${
              !AUTOMATION_CHANNELS_ENABLED
                ? "border-border bg-muted/30 opacity-60 cursor-not-allowed"
                : activeRail === "jobBoards"
                  ? "border-primary bg-primary/[0.03] shadow-xs cursor-pointer"
                  : "border-border bg-card hover:border-border/80 cursor-pointer"
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-md bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                <Globe size={12} />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-foreground truncate">
                  Cổng tuyển dụng khác
                </p>
                {!AUTOMATION_CHANNELS_ENABLED ? (
                  <p className="text-[10px] text-muted-foreground">
                    Đang phát triển
                  </p>
                ) : (
                  jobBoardsSelectedCount > 0 && (
                    <p className="text-[10px] text-primary font-semibold">
                      {jobBoardsSelectedCount} kênh đã chọn
                    </p>
                  )
                )}
              </div>
            </div>
            {!AUTOMATION_CHANNELS_ENABLED ? (
              <Lock size={13} className="shrink-0 text-muted-foreground" />
            ) : (
              <ChevronRight
                size={13}
                className={`shrink-0 text-muted-foreground transition-transform ${
                  activeRail === "jobBoards" ? "rotate-90" : ""
                }`}
              />
            )}
          </button>
        )}
      </div>

      {/* ─── RIGHT PANEL ─── */}
      {AUTOMATION_CHANNELS_ENABLED && activeRail && (
        <div className="flex-1 min-w-0 border-l border-border pl-4 space-y-3.5 animate-in fade-in slide-in-from-left-2 duration-200">
          {activeRail === "fbGroups" && (
            <>
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-foreground flex items-center gap-1.5">
                  <Link2 size={12} /> Dán đường dẫn nhóm Facebook
                </label>
                <div className="flex gap-1.5">
                  <input
                    type="url"
                    placeholder="https://facebook.com/groups/..."
                    value={pasteLink}
                    onChange={(e) => {
                      setPasteLink(e.target.value);
                      setPasteError(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddPastedLink();
                      }
                    }}
                    className="flex h-8 flex-1 min-w-0 rounded-md border border-input bg-background px-2 py-1 text-[11px]"
                  />
                  <button
                    type="button"
                    onClick={handleAddPastedLink}
                    className="btn-secondary text-[11px] h-8 px-2.5 shrink-0 cursor-pointer"
                  >
                    Thêm
                  </button>
                </div>
                {pasteError && (
                  <p className="text-[10px] text-rose-600">{pasteError}</p>
                )}
                {pendingNewGroupUrl && (
                  <div className="p-2.5 rounded-lg border border-dashed border-primary/40 bg-primary/[0.03] space-y-2">
                    <p className="text-[10px] text-muted-foreground">
                      Nhóm chưa có trong hệ thống. Đặt tên để thêm nhóm mới và
                      chọn ngay:
                    </p>
                    <input
                      type="text"
                      placeholder="Tên nhóm Facebook"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      className="flex h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-[11px]"
                    />
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={handleConfirmCreateGroup}
                        disabled={isCreatingGroup}
                        className="btn-primary text-[11px] h-7 px-2.5 flex-1 cursor-pointer disabled:opacity-50"
                      >
                        {isCreatingGroup
                          ? "Đang thêm..."
                          : "+ Thêm nhóm & chọn"}
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelCreateGroup}
                        disabled={isCreatingGroup}
                        className="btn-secondary text-[11px] h-7 px-2.5 cursor-pointer disabled:opacity-50"
                      >
                        Hủy
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {selectedGroups.length > 0 && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                    Đã chọn
                  </label>
                  <div className="space-y-1">
                    {selectedGroups.map((g) => (
                      <div
                        key={g.id}
                        className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-md bg-primary/[0.05] border border-primary/20"
                      >
                        <span className="text-[11px] font-medium text-foreground truncate">
                          {g.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeGroup(g.id)}
                          className="text-muted-foreground hover:text-rose-600 shrink-0 cursor-pointer"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                    Gợi ý nhóm phù hợp
                  </label>
                  <button
                    type="button"
                    onClick={fetchRecommendations}
                    disabled={isLoadingRecs}
                    className="text-[10px] text-primary hover:underline inline-flex items-center gap-1 disabled:opacity-50 cursor-pointer"
                  >
                    <RefreshCw
                      size={10}
                      className={isLoadingRecs ? "animate-spin" : ""}
                    />
                    Làm mới
                  </button>
                </div>

                {isLoadingRecs && !hasFetchedRecs ? (
                  <div className="p-3 text-center text-[11px] text-muted-foreground border border-dashed border-border rounded-lg">
                    Đang tìm nhóm phù hợp...
                  </div>
                ) : visibleRecommendations.length === 0 ? (
                  <div className="p-3 text-center text-[11px] text-muted-foreground border border-dashed border-border rounded-lg">
                    Không còn gợi ý khả dụng.
                  </div>
                ) : (
                  <div className="max-h-44 overflow-y-auto space-y-1.5 pr-1">
                    {visibleRecommendations.map((rec) => (
                      <div
                        key={rec.group.id}
                        onClick={() => addGroup(rec.group.id, rec.group.name)}
                        className="p-2 rounded-lg border border-border bg-card hover:border-primary/50 cursor-pointer transition-all flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <p className="text-[11px] font-semibold text-foreground truncate">
                            {rec.group.name}
                          </p>
                          {rec.isDirectMatch && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 border border-emerald-200 inline-flex items-center gap-0.5 mt-0.5">
                              <Sparkles size={9} /> Phù hợp trực tiếp
                            </span>
                          )}
                        </div>
                        <Square
                          size={14}
                          className="text-muted-foreground/40 shrink-0"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {selectedGroups.length > 0 && (
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border">
                  <div>
                    <label className="text-[10px] text-muted-foreground mb-1 flex items-center gap-1">
                      <Calendar size={10} /> Ngày đăng
                    </label>
                    <input
                      type="date"
                      value={targetDate}
                      onChange={(e) => setTargetDate(e.target.value)}
                      className="flex h-7 w-full rounded-md border border-input bg-background px-2 py-1 text-[10px] font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground mb-1 flex items-center gap-1">
                      <Timer size={10} /> Đệm tối thiểu (phút)
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={minBufferMinutes}
                      onChange={(e) =>
                        setMinBufferMinutes(Number(e.target.value) || 1)
                      }
                      className="flex h-7 w-full rounded-md border border-input bg-background px-2 py-1 text-[10px] font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground mb-1 flex items-center gap-1">
                      <Clock size={10} /> Bắt đầu
                    </label>
                    <input
                      type="time"
                      value={windowStartTime}
                      onChange={(e) => setWindowStartTime(e.target.value)}
                      className="flex h-7 w-full rounded-md border border-input bg-background px-2 py-1 text-[10px] font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground mb-1 flex items-center gap-1">
                      <Clock size={10} /> Kết thúc
                    </label>
                    <input
                      type="time"
                      value={windowEndTime}
                      onChange={(e) => setWindowEndTime(e.target.value)}
                      className="flex h-7 w-full rounded-md border border-input bg-background px-2 py-1 text-[10px] font-mono"
                    />
                  </div>
                </div>
              )}
            </>
          )}

          {activeRail === "jobBoards" && (
            <div className="space-y-3">
              {visibleJobBoardPlatforms.map((platform) => {
                const cfg = JOB_BOARDS_CONFIG[platform];
                const state = jobBoards[platform];
                return (
                  <div
                    key={platform}
                    className={`p-2.5 rounded-lg border space-y-2 transition-all ${
                      state.enabled
                        ? "border-primary bg-primary/[0.03]"
                        : "border-border bg-card"
                    }`}
                  >
                    <div
                      className="flex items-center gap-2 cursor-pointer select-none"
                      onClick={() => toggleJobBoard(platform)}
                    >
                      {state.enabled ? (
                        <CheckSquare size={15} className="text-primary shrink-0" />
                      ) : (
                        <Square
                          size={15}
                          className="text-muted-foreground/40 shrink-0"
                        />
                      )}
                      <div
                        className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-[9px] shrink-0 ${cfg.iconBg}`}
                      >
                        {cfg.badgeLabel.slice(0, 2).toUpperCase()}
                      </div>
                      <p className="text-[11px] font-bold text-foreground truncate">
                        {cfg.label}
                      </p>
                    </div>
                    <input
                      type="url"
                      placeholder="https://... (đường dẫn trang tuyển dụng công ty)"
                      value={state.targetDestination}
                      onChange={(e) =>
                        setJobBoardDestination(platform, e.target.value)
                      }
                      disabled={!state.enabled}
                      className="flex h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-[11px] disabled:opacity-50"
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
});

export default AutomationChannelsPanel;
