// "use client";
// /* eslint-disable @typescript-eslint/no-explicit-any */

// import React, { useEffect, useState, useRef } from "react";
// import { useForm } from "react-hook-form";
// import { useRouter } from "next/navigation";
// import {
//   Sparkles,
//   Send,
//   CheckCircle2,
//   Clock,
//   Save,
//   Building2,
//   FileText,
//   DollarSign,
//   Users,
//   Copy,
//   ShieldCheck,
//   Globe,
//   Loader2,
//   Briefcase,
//   User,
//   MapPin,
//   Calendar,
//   GraduationCap,
//   Layers,
//   HeartHandshake,
//   X,
//   Edit3,
//   LayoutTemplate,
//   ActivitySquare,
//   ChevronRight,
//   SlidersHorizontal,
// } from "lucide-react";
// import { gooeyToast } from "@/components/ui/goey-toaster";
// import ActionButton from "@/components/buttons/ActionButton";
// import {
//   HorizontalDetailLayout,
//   HorizontalDetailAccordion,
// } from "@/components/layouts/HorizontalDetailLayout";

// // ─── API HOOKS ───
// import {
//   useGetRecruitmentRequestQuery,
//   useUpdateRecruitmentRequestMutation,
//   useGenerateJdDraftMutation,
//   useRequestApprovalMutation,
//   useApproveRequestMutation,
//   useForceApproveMutation,
//   usePublishJobMutation,
//   useGetSuggestionsQuery,
//   useCloneJobPostMutation,
//   RecruitmentRequestStatus,
// } from "@/lib/store/atsApiSlice";

// // ─── UI HELPERS ───
// const STATUS_LABELS: Record<
//   string,
//   { label: string; bg: string; text: string; icon: any }
// > = {
//   [RecruitmentRequestStatus.DRAFT]: {
//     label: "Bản nháp",
//     bg: "bg-muted",
//     text: "text-muted-foreground",
//     icon: FileText,
//   },
//   [RecruitmentRequestStatus.PENDING_HR]: {
//     label: "HR Tiếp nhận",
//     bg: "bg-amber-100",
//     text: "text-amber-700",
//     icon: Clock,
//   },
//   [RecruitmentRequestStatus.PENDING_APPROVAL]: {
//     label: "Chờ duyệt",
//     bg: "bg-purple-100",
//     text: "text-purple-700",
//     icon: ShieldCheck,
//   },
//   [RecruitmentRequestStatus.APPROVED]: {
//     label: "Sẵn sàng đăng",
//     bg: "bg-emerald-100",
//     text: "text-emerald-700",
//     icon: CheckCircle2,
//   },
//   [RecruitmentRequestStatus.REJECTED]: {
//     label: "Từ chối",
//     bg: "bg-red-100",
//     text: "text-red-700",
//     icon: X,
//   },
// };

// const PLATFORMS = ["Website Công ty", "LinkedIn", "TopCV", "VietnamWorks"];

// // ─── MARKDOWN PARSERS ───
// const parseMarkdownToHTML = (md: string) => {
//   if (!md) return "";
//   let html = md;
//   html = html.replace(
//     /^### (.*$)/gim,
//     '<h3 class="text-base font-bold text-foreground mt-5 mb-2">$1</h3>',
//   );
//   html = html.replace(
//     /^## (.*$)/gim,
//     '<h2 class="text-lg font-bold text-foreground mt-6 mb-3">$1</h2>',
//   );
//   html = html.replace(
//     /^# (.*$)/gim,
//     '<h1 class="text-xl font-bold text-foreground mt-6 mb-3">$1</h1>',
//   );
//   html = html.replace(
//     /\*\*(.*?)\*\*/gim,
//     '<strong class="font-semibold text-foreground">$1</strong>',
//   );
//   html = html.replace(
//     /^\s*-\s(.*$)/gim,
//     '<li class="ml-5 list-disc marker:text-primary/50 text-sm mb-1">$1</li>',
//   );
//   html = html.replace(/\n(?!\<li|\<h)/gim, "<br/>");
//   return html;
// };

// const parseMarkdownForSocialMedia = (md: string) => {
//   if (!md) return "";
//   let html = md;
//   html = html.replace(
//     /^### (.*$)/gim,
//     '<strong class="block text-[15px] font-bold mt-4 mb-1">🔥 $1</strong>',
//   );
//   html = html.replace(
//     /^## (.*$)/gim,
//     '<strong class="block text-[16px] font-bold mt-4 mb-1">🎯 $1</strong>',
//   );
//   html = html.replace(
//     /^# (.*$)/gim,
//     '<strong class="block text-[18px] font-bold mt-5 mb-2">📣 $1</strong>',
//   );
//   html = html.replace(
//     /\*\*(.*?)\*\*/gim,
//     '<strong class="font-bold">$1</strong>',
//   );
//   html = html.replace(/^\s*-\s(.*$)/gim, "✅ $1<br/>");
//   html = html.replace(/\n/g, "<br/>");
//   return html;
// };

// // ─── PREVIEW COMPONENTS ───
// const JobBoardPreview = ({ formValues, jobTitle, department }: any) => {
//   const {
//     aiDraftedDescription,
//     targetSalaryMin,
//     targetSalaryMax,
//     location,
//     experienceYears,
//     level,
//     workingModel,
//     jobType,
//     mustHaveSkills,
//     niceToHaveSkills,
//   } = formValues;
//   const htmlContent = parseMarkdownToHTML(
//     aiDraftedDescription || "*Nội dung JD đang trống...*",
//   );
//   const mustHave = Array.isArray(mustHaveSkills)
//     ? mustHaveSkills
//     : mustHaveSkills?.split(",").filter(Boolean) || [];
//   const niceToHave = Array.isArray(niceToHaveSkills)
//     ? niceToHaveSkills
//     : niceToHaveSkills?.split(",").filter(Boolean) || [];

//   return (
//     <div className="w-full h-full min-h-[500px] overflow-y-auto bg-[#F3F5F7] rounded-xl border border-border p-4 sm:p-6 custom-scrollbar flex justify-center">
//       <div className="w-full max-w-2xl bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-fit">
//         <div className="h-20 bg-gradient-to-r from-primary/80 to-primary/40 w-full relative">
//           <div className="absolute -bottom-6 left-6 w-14 h-14 bg-white rounded-lg shadow border border-gray-100 flex items-center justify-center p-2">
//             <Building2 className="text-primary w-full h-full opacity-80" />
//           </div>
//         </div>
//         <div className="px-6 pt-8 pb-5 border-b border-gray-100">
//           <h1 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">
//             {jobTitle || "Chưa có tiêu đề"}
//           </h1>
//           <p className="text-xs text-gray-500 font-medium mb-3">
//             Công ty CP Thiết kế Xây dựng Chính Nam · {department}
//           </p>
//           <div className="flex flex-wrap gap-2">
//             <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-md text-xs font-semibold border border-emerald-100">
//               <DollarSign size={13} />{" "}
//               {targetSalaryMin ? `${targetSalaryMin}M` : "0"} -{" "}
//               {targetSalaryMax ? `${targetSalaryMax}M` : "Thỏa thuận"}
//             </span>
//             <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-gray-50 text-gray-700 rounded-md text-xs font-medium border border-gray-200">
//               <MapPin size={13} className="text-gray-400" />{" "}
//               {location || "TP. Hồ Chí Minh"}
//             </span>
//             <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-gray-50 text-gray-700 rounded-md text-xs font-medium border border-gray-200">
//               <Briefcase size={13} className="text-gray-400" />{" "}
//               {experienceYears
//                 ? `${experienceYears} năm kinh nghiệm`
//                 : "Không yêu cầu KN"}
//             </span>
//           </div>
//         </div>
//         <div className="px-6 py-3 bg-gray-50 border-b border-gray-100 flex flex-wrap items-center gap-1.5">
//           <span className="text-[11px] font-semibold text-gray-500 mr-1 uppercase tracking-wider">
//             Kỹ năng:
//           </span>
//           {mustHave.map((s: string, idx: number) => (
//             <span
//               key={idx}
//               className="px-2 py-0.5 bg-white border border-gray-200 text-gray-700 text-xs rounded shadow-sm"
//             >
//               {s.trim()}
//             </span>
//           ))}
//           {niceToHave.map((s: string, idx: number) => (
//             <span
//               key={`nice-${idx}`}
//               className="px-2 py-0.5 bg-transparent border border-dashed border-gray-300 text-gray-500 text-xs rounded"
//             >
//               {s.trim()}
//             </span>
//           ))}
//         </div>
//         <div className="p-6">
//           <div className="grid grid-cols-3 gap-3 mb-6 bg-gray-50/50 p-3 rounded-lg border border-gray-100">
//             <div>
//               <p className="text-[10px] text-gray-500 uppercase font-semibold">
//                 Cấp bậc
//               </p>
//               <p className="text-xs font-medium text-gray-900 mt-0.5">
//                 {level || "—"}
//               </p>
//             </div>
//             <div>
//               <p className="text-[10px] text-gray-500 uppercase font-semibold">
//                 Loại hình
//               </p>
//               <p className="text-xs font-medium text-gray-900 mt-0.5">
//                 {jobType || "—"}
//               </p>
//             </div>
//             <div>
//               <p className="text-[10px] text-gray-500 uppercase font-semibold">
//                 Mô hình
//               </p>
//               <p className="text-xs font-medium text-gray-900 mt-0.5">
//                 {workingModel || "—"}
//               </p>
//             </div>
//           </div>
//           <div
//             className="text-gray-800 text-xs leading-relaxed"
//             dangerouslySetInnerHTML={{ __html: htmlContent }}
//           />
//         </div>
//       </div>
//     </div>
//   );
// };

// const FacebookPreview = ({ formValues, jobTitle, department }: any) => {
//   const htmlContent = parseMarkdownForSocialMedia(
//     formValues.aiDraftedDescription || "*Chưa có nội dung JD...*",
//   );
//   return (
//     <div className="w-full h-full min-h-[500px] overflow-y-auto bg-[#F0F2F5] rounded-xl border border-border p-4 sm:p-6 custom-scrollbar flex justify-center">
//       <div className="w-full max-w-[460px] bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-fit font-sans">
//         <div className="flex items-center gap-3 p-4">
//           <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white font-bold shrink-0 shadow-sm border border-primary/20 text-xs">
//             CN
//           </div>
//           <div>
//             <p className="text-[14px] font-bold text-[#050505] leading-tight">
//               Chính Nam E&C - Tuyển dụng
//             </p>
//             <div className="flex items-center gap-1 text-[12px] text-[#65676B] mt-0.5">
//               <span>Vừa xong</span>
//               <span>·</span>
//               <Globe size={11} />
//             </div>
//           </div>
//         </div>
//         <div
//           className="px-4 pb-3 text-[14px] text-[#050505] leading-snug"
//           dangerouslySetInnerHTML={{ __html: htmlContent }}
//         />
//         <div className="w-full bg-gradient-to-br from-[#F0F2F5] to-gray-200 aspect-video flex flex-col items-center justify-center text-[#65676B] border-y border-gray-200 relative overflow-hidden">
//           <Briefcase size={32} className="mb-2 opacity-60 text-primary" />
//           <p className="text-sm font-bold uppercase text-gray-800 z-10 px-4 text-center">
//             {jobTitle}
//           </p>
//           <p className="text-xs font-medium z-10 mt-0.5">{department}</p>
//         </div>
//       </div>
//     </div>
//   );
// };

// const LinkedInPreview = ({ formValues, jobTitle, department }: any) => {
//   const htmlContent = parseMarkdownForSocialMedia(
//     formValues.aiDraftedDescription || "*Chưa có nội dung JD...*",
//   );
//   return (
//     <div className="w-full h-full min-h-[500px] overflow-y-auto bg-[#F3F2EF] rounded-xl border border-border p-4 sm:p-6 custom-scrollbar flex justify-center">
//       <div className="w-full max-w-[460px] bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-fit font-sans">
//         <div className="flex items-start gap-3 p-4 pb-2">
//           <div className="w-10 h-10 rounded-sm bg-primary flex items-center justify-center text-white font-bold shrink-0 shadow-sm text-xs">
//             CN
//           </div>
//           <div className="flex-1">
//             <p className="text-[13px] font-bold text-[#000000] leading-tight hover:text-[#0a66c2] cursor-pointer">
//               Chính Nam E&C
//             </p>
//             <p className="text-[11px] text-[#00000099] leading-tight mt-0.5">
//               15,234 followers
//             </p>
//           </div>
//         </div>
//         <div
//           className="px-4 pb-3 text-[13px] text-[#000000e6] leading-relaxed"
//           dangerouslySetInnerHTML={{ __html: htmlContent }}
//         />
//       </div>
//     </div>
//   );
// };

// const FieldWrapper = ({ children, label, required = false }: any) => (
//   <div className="space-y-1.5">
//     <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
//       <span>
//         {label} {required && <span className="text-red-500">*</span>}
//       </span>
//     </label>
//     {children}
//   </div>
// );

// // ─── MAIN COMPONENT ───
// export default function RecruitmentRequestDetailClient({
//   requestId,
// }: {
//   requestId: string;
// }) {
//   const router = useRouter();

//   const {
//     data: res,
//     isFetching,
//     refetch,
//   } = useGetRecruitmentRequestQuery(requestId);
//   const request = res?.data;

//   const [updateRequest, { isLoading: isUpdating }] =
//     useUpdateRecruitmentRequestMutation();
//   const [generateAi] = useGenerateJdDraftMutation();
//   const [requestApproval, { isLoading: isRequestingApprove }] =
//     useRequestApprovalMutation();
//   const [approveRequest, { isLoading: isApproving }] =
//     useApproveRequestMutation();
//   const [forceApprove, { isLoading: isForceApproving }] =
//     useForceApproveMutation();
//   const [publishJob, { isLoading: isPublishing }] = usePublishJobMutation();
//   const [cloneJobPost, { isLoading: isCloning }] = useCloneJobPostMutation();

//   const { register, handleSubmit, watch, reset, setValue } = useForm<any>();
//   const [isGenerating, setIsGenerating] = useState(false);
//   const [showCloneModal, setShowCloneModal] = useState(false);
//   const [viewMode, setViewMode] = useState<
//     "edit" | "preview_board" | "preview_fb" | "preview_linkedin"
//   >("edit");

//   // ─── STICKY MAX 2 PANELS OPEN LOGIC ───
//   const [openOrder, setOpenOrder] = useState<string[]>(["jd", "structure"]);

//   const togglePanel = (key: string) => {
//     setOpenOrder((prev) => {
//       if (prev.includes(key)) {
//         // Không cho phép đóng hết nếu chỉ còn 1 cái, hoặc cho phép tùy ý
//         if (prev.length === 1) return prev;
//         return prev.filter((k) => k !== key);
//       } else {
//         // Nếu đã mở đủ 2 cái, xóa cái cũ nhất (phần tử đầu tiên) và push cái mới vào cuối
//         if (prev.length >= 2) {
//           return [prev[1], key];
//         }
//         return [...prev, key];
//       }
//     });
//   };

//   const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([
//     "Website Công ty",
//     "LinkedIn",
//   ]);
//   const [isScheduled, setIsScheduled] = useState(false);
//   const [scheduleTime, setScheduleTime] = useState("");

//   const isFormInitialized = useRef(false);

//   const { data: suggestionsRes, isFetching: loadingSuggestions } =
//     useGetSuggestionsQuery(
//       {
//         department: request?.department || "",
//         jobTitle: request?.jobTitle || "",
//       },
//       { skip: !showCloneModal || !request },
//     );

//   useEffect(() => {
//     if (request && !isFormInitialized.current) {
//       reset({
//         headcount: request.headcount || 1,
//         deadline: request.deadline
//           ? new Date(request.deadline).toISOString().split("T")[0]
//           : "",
//         level: request.level || "",
//         jobType: request.jobType || "",
//         workingModel: request.workingModel || "Onsite",
//         location: request.location || "",
//         workingHours: request.workingHours || "",
//         experienceYears: request.experienceYears || "",
//         educationLevel: request.educationLevel || "",
//         gender: request.gender || "",
//         ageRange: request.ageRange || "",
//         mustHaveSkills: request.mustHaveSkills?.join(", ") || "",
//         niceToHaveSkills: request.niceToHaveSkills?.join(", ") || "",
//         languages: request.languages || "",
//         companyBenefits: request.companyBenefits || "",
//         aiDraftedDescription: request.aiDraftedDescription || "",
//         aiPrompt: "",
//       });
//       isFormInitialized.current = true;
//     }

//     const aiGenState = sessionStorage.getItem(`ai_gen_${requestId}`);
//     if (aiGenState === "true") {
//       if (request?.aiDraftedDescription) {
//         setIsGenerating(false);
//         sessionStorage.removeItem(`ai_gen_${requestId}`);
//       } else {
//         setIsGenerating(true);
//       }
//     }
//   }, [request, reset, requestId]);

//   useEffect(() => {
//     const handleJdReady = (e: any) => {
//       const { requestId: eventReqId, data } = e.detail || {};
//       if (eventReqId === requestId) {
//         setIsGenerating(false);
//         sessionStorage.removeItem(`ai_gen_${requestId}`);

//         if (data) {
//           Object.keys(data).forEach((key) => {
//             let val = data[key];
//             if (
//               Array.isArray(val) &&
//               (key === "mustHaveSkills" || key === "niceToHaveSkills")
//             ) {
//               val = val.join(", ");
//             }
//             if (key === "description" && !data.aiDraftedDescription) {
//               setValue("aiDraftedDescription", val, { shouldDirty: true });
//             } else if (key !== "requestId") {
//               setValue(key, val, { shouldDirty: true });
//             }
//           });
//         }
//         setViewMode("preview_board");
//         setOpenOrder(["structure", "jd"]);
//         refetch();
//       }
//     };

//     const handleJdFailed = (e: any) => {
//       const { requestId: eventReqId } = e.detail || {};
//       if (eventReqId === requestId) {
//         setIsGenerating(false);
//         sessionStorage.removeItem(`ai_gen_${requestId}`);
//       }
//     };

//     window.addEventListener("JD_DRAFT_READY", handleJdReady);
//     window.addEventListener("JD_DRAFT_FAILED", handleJdFailed);

//     return () => {
//       window.removeEventListener("JD_DRAFT_READY", handleJdReady);
//       window.removeEventListener("JD_DRAFT_FAILED", handleJdFailed);
//     };
//   }, [requestId, refetch, setValue]);

//   const handleSaveDraft = async (data: any) => {
//     try {
//       const formattedData = {
//         ...data,
//         headcount: data.headcount ? Number(data.headcount) : undefined,
//         experienceYears: data.experienceYears
//           ? Number(data.experienceYears)
//           : undefined,
//         mustHaveSkills: data.mustHaveSkills
//           ? data.mustHaveSkills
//               .split(",")
//               .map((s: string) => s.trim())
//               .filter(Boolean)
//           : [],
//         niceToHaveSkills: data.niceToHaveSkills
//           ? data.niceToHaveSkills
//               .split(",")
//               .map((s: string) => s.trim())
//               .filter(Boolean)
//           : [],
//         deadline: data.deadline
//           ? new Date(data.deadline).toISOString()
//           : undefined,
//       };
//       await updateRequest({ id: requestId, body: formattedData }).unwrap();
//       gooeyToast.success("Lưu nháp thành công!");
//     } catch {
//       gooeyToast.error("Lỗi khi lưu dữ liệu");
//     }
//   };

//   const handleGenerateAI = async () => {
//     const formVals = watch();

//     // Xây dựng template prompt chứa toàn bộ dữ liệu từ form input hiện tại
//     const finalPrompt = `
//       Bạn là Chuyên gia Tuyển dụng (Technical Recruiter). 
//       Trưởng bộ phận vừa gửi một yêu cầu tuyển dụng thô cho vị trí "${request?.jobTitle}".
//       Yêu cầu thô: "${request?.rawRequirements}"
//       Lý do tuyển: "${request?.reasonForHiring}"
//       Phòng ban: "${request?.department}"
//       Quyền lợi công ty: "${formVals.companyBenefits || request?.companyBenefits || "Theo quy định nhà nước và chính sách công ty"}"
//       Cấp bậc hiện tại: "${formVals.level || "Chưa xác định"}"
//       Địa điểm: "${formVals.location || request?.location || "TP. Hồ Chí Minh"}"
//       Kỹ năng bắt buộc đang nhập: "${formVals.mustHaveSkills || "Chưa có"}"
      
//       NHIỆM VỤ CỦA BẠN:
//       Dựa vào các thông tin trên, hãy suy luận và điền đầy đủ các thông số tuyển dụng còn thiếu.
//       PHẢI trả về ĐÚNG định dạng JSON sau (không markdown, không text thừa):
//       {
//         "aiDraftedDescription": "Viết JD thật chuyên nghiệp, thu hút bằng Markdown (Gồm: Giới thiệu, Trách nhiệm, Yêu cầu, Quyền lợi)",
//         "level": "Chọn 1 trong: Intern, Fresher, Junior, Middle, Senior, Manager, Director",
//         "jobType": "Chọn 1 trong: Full-time, Part-time, Freelance, Contract",
//         "workingModel": "Chọn 1 trong: Onsite, Remote, Hybrid",
//         "experienceYears": "Điền số nguyên (VD: 0, 1, 3, 5). Nếu không yêu cầu kinh nghiệm điền 0",
//         "educationLevel": "Chọn 1 trong: Không yêu cầu, Cao đẳng, Đại học, Thạc sĩ",
//         "mustHaveSkills": ["Kỹ năng bắt buộc 1", "Kỹ năng bắt buộc 2"],
//         "niceToHaveSkills": ["Kỹ năng ưu tiên 1", "Kỹ năng ưu tiên 2"],
//         "gender": "Nam | Nữ | Không yêu cầu",
//         "ageRange": "VD: 22-30 hoặc Không yêu cầu",
//         "languages": "VD: Tiếng Anh giao tiếp hoặc Không yêu cầu"
//       }
//     `;

//     try {
//       setIsGenerating(true);
//       sessionStorage.setItem(`ai_gen_${requestId}`, "true");
//       setViewMode("edit");
//       setOpenOrder(["structure", "jd"]);

//       handleSubmit(handleSaveDraft)();
//       await generateAi({
//         id: requestId,
//         body: { customPrompt: finalPrompt },
//       }).unwrap();
//     } catch {
//       setIsGenerating(false);
//       sessionStorage.removeItem(`ai_gen_${requestId}`);
//       gooeyToast.error("Lỗi kích hoạt AI.");
//     }
//   };

//   const handleClone = async (sourceJobId: string) => {
//     try {
//       await cloneJobPost({
//         id: requestId,
//         sourceJobPostId: sourceJobId,
//       }).unwrap();
//       setShowCloneModal(false);
//       gooeyToast.success("Đã áp dụng mẫu JD thành công!");
//     } catch {
//       gooeyToast.error("Lỗi khi sao chép JD.");
//     }
//   };

//   const handlePublish = async () => {
//     try {
//       await publishJob({
//         id: requestId,
//         body: {
//           aiDraftedDescription: watch("aiDraftedDescription"),
//           companyBenefits: watch("companyBenefits"),
//           isScheduled,
//           scheduledPublishTime: isScheduled ? scheduleTime : undefined,
//         },
//       }).unwrap();
//       gooeyToast.success("Tin tuyển dụng đã được xuất bản!");
//       router.push("/vi/hr/jobs-management");
//     } catch {
//       gooeyToast.error("Lỗi xuất bản tin tuyển dụng.");
//     }
//   };

//   if (isFetching && !request) {
//     return (
//       <div className="p-8 text-center text-muted-foreground animate-pulse">
//         Đang tải dữ liệu Yêu cầu...
//       </div>
//     );
//   }

//   if (!request) {
//     return (
//       <div className="p-8 text-center text-red-500">
//         Không tìm thấy yêu cầu này.
//       </div>
//     );
//   }

//   const currentStatus =
//     STATUS_LABELS[request.status] ||
//     STATUS_LABELS[RecruitmentRequestStatus.DRAFT];
//   const isApproved = request.status === RecruitmentRequestStatus.APPROVED;
//   const isPendingApproval =
//     request.status === RecruitmentRequestStatus.PENDING_APPROVAL;
//   const isEditable = !isApproved && !isPendingApproval;

//   return (
//     <>
//       <HorizontalDetailLayout
//         title={
//           <div className="flex items-center gap-2 min-w-0">
//             <span>Yêu cầu tuyển dụng</span>
//             <ChevronRight size={13} className="text-muted-foreground" />
//             <span className="text-foreground truncate">{request.jobTitle}</span>
//           </div>
//         }
//         onBack={() => router.push("/vi/hr/request-management")}
//         headerActions={
//           <div className="flex items-center gap-2">
//             <span
//               className={`inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${currentStatus.bg} ${currentStatus.text}`}
//             >
//               <currentStatus.icon size={12} /> {currentStatus.label}
//             </span>
//           </div>
//         }
//         /* ─── CỘT 1: THÔNG TIN NỘI BỘ (LEFT CONTEXT SIDEBAR) ─── */
//         sidebar={{
//           defaultCollapsed: false,
//           content: (collapsed) =>
//             collapsed ? (
//               <div className="flex flex-col items-center py-6 gap-6 text-muted-foreground fade-in h-full overflow-y-auto scrollbar-hide">
//                 <div
//                   className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shadow-md cursor-help border border-primary/20"
//                   title={`${request.jobTitle} - ${request.department}`}
//                 >
//                   {request.jobTitle.charAt(0).toUpperCase()}
//                 </div>
//                 <div className="w-8 h-px bg-border my-2" />
//                 <div className="flex flex-col gap-4 items-center">
//                   <Briefcase size={16} title="Vị trí" />
//                   <Building2 size={16} title="Phòng ban" />
//                   <DollarSign size={16} title="Ngân sách" />
//                   <User size={16} title="Người yêu cầu" />
//                 </div>
//               </div>
//             ) : (
//               <div className="flex flex-col h-full fade-in p-5 space-y-6 overflow-y-auto custom-scrollbar">
//                 <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 relative overflow-hidden shadow-sm shrink-0">
//                   <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
//                   <h3 className="text-[10px] font-bold uppercase tracking-widest text-primary mb-3 flex items-center gap-1.5">
//                     <Briefcase size={12} /> Thông tin vị trí
//                   </h3>
//                   <h2 className="text-base font-bold text-foreground mb-1 leading-tight">
//                     {request.jobTitle}
//                   </h2>
//                   <p className="text-xs text-muted-foreground mb-4">
//                     {request.department}
//                   </p>
//                   <div className="space-y-2.5 pt-3 border-t border-primary/10">
//                     <div className="flex justify-between items-center text-xs">
//                       <span className="text-muted-foreground flex items-center gap-1.5">
//                         <Users size={12} /> Số lượng:
//                       </span>
//                       <span className="font-bold text-foreground">
//                         {request.headcount}
//                       </span>
//                     </div>
//                     <div className="flex justify-between items-center text-xs">
//                       <span className="text-muted-foreground flex items-center gap-1.5">
//                         <DollarSign size={12} /> Ngân sách:
//                       </span>
//                       <span className="font-semibold text-emerald-600">
//                         {request.targetSalaryMin
//                           ? `${request.targetSalaryMin}M`
//                           : "0"}{" "}
//                         -{" "}
//                         {request.targetSalaryMax
//                           ? `${request.targetSalaryMax}M`
//                           : "Thỏa thuận"}
//                       </span>
//                     </div>
//                   </div>
//                 </div>

//                 <div>
//                   <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground border-b border-border pb-2 mb-3 flex items-center gap-1.5">
//                     <User size={12} /> Người yêu cầu
//                   </h3>
//                   <p className="text-xs font-semibold text-foreground">
//                     {request.requester?.fullName || "System"}
//                   </p>
//                 </div>

//                 <div>
//                   <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground border-b border-border pb-2 mb-3 flex items-center gap-1.5">
//                     <HeartHandshake size={12} /> Lý do tuyển dụng
//                   </h3>
//                   <p className="text-xs text-foreground leading-relaxed bg-muted/20 p-3 rounded-lg border border-border/50">
//                     {request.reasonForHiring || "Không có dữ liệu"}
//                   </p>
//                 </div>

//                 <div>
//                   <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground border-b border-border pb-2 mb-3 flex items-center gap-1.5">
//                     <FileText size={12} /> Yêu cầu thô ban đầu
//                   </h3>
//                   <div className="text-xs text-amber-900 bg-amber-500/10 border border-amber-500/20 p-3 rounded-lg leading-relaxed whitespace-pre-wrap">
//                     {request.rawRequirements || "Không có mô tả sơ bộ"}
//                   </div>
//                 </div>
//               </div>
//             ),
//         }}
//         /* ─── SIDE PANEL: HORIZONTAL DETAIL ACCORDIONS (MAX 2 OPEN AT A TIME) ─── */
//         sidePanel={
//           <>
//             {/* 1. HORIZONTAL ACCORDION: DỮ LIỆU CẤU TRÚC (FORM INPUT) */}
//             <HorizontalDetailAccordion
//               title="Dữ liệu Cấu trúc"
//               icon={<Layers size={14} />}
//               isExpanded={openOrder.includes("structure")}
//               onToggle={() => togglePanel("structure")}
//               expandedWidth="lg:w-[480px]"
//             >
//               <div className="space-y-4">
//                 <p className="text-xs text-muted-foreground leading-relaxed">
//                   Thiết lập đầy đủ các tiêu chí chuẩn hóa phục vụ đồng thời cho
//                   form đăng tuyển và ngữ cảnh AI.
//                 </p>

//                 <fieldset
//                   disabled={isGenerating || !isEditable}
//                   className="space-y-4"
//                 >
//                   <div className="grid grid-cols-2 gap-3">
//                     <FieldWrapper label="Cấp bậc">
//                       <select
//                         {...register("level")}
//                         className="input-base w-full text-xs bg-background"
//                       >
//                         <option value="">-- Chọn --</option>
//                         <option value="Intern">Intern / Thực tập</option>
//                         <option value="Fresher">Fresher</option>
//                         <option value="Junior">Junior</option>
//                         <option value="Middle">Middle</option>
//                         <option value="Senior">Senior</option>
//                         <option value="Manager">Manager</option>
//                       </select>
//                     </FieldWrapper>
//                     <FieldWrapper label="Loại hợp đồng">
//                       <select
//                         {...register("jobType")}
//                         className="input-base w-full text-xs bg-background"
//                       >
//                         <option value="Full-time">Toàn thời gian</option>
//                         <option value="Part-time">Bán thời gian</option>
//                         <option value="Contractor">Nhà thầu / Freelance</option>
//                       </select>
//                     </FieldWrapper>
//                     <FieldWrapper label="Mô hình làm việc">
//                       <select
//                         {...register("workingModel")}
//                         className="input-base w-full text-xs bg-background"
//                       >
//                         <option value="Onsite">Onsite</option>
//                         <option value="Hybrid">Hybrid</option>
//                         <option value="Remote">Remote</option>
//                       </select>
//                     </FieldWrapper>
//                     <FieldWrapper label="Kinh nghiệm (Năm)">
//                       <input
//                         type="number"
//                         step="0.5"
//                         {...register("experienceYears")}
//                         placeholder="VD: 2"
//                         className="input-base w-full text-xs bg-background"
//                       />
//                     </FieldWrapper>
//                   </div>

//                   <FieldWrapper label="Kỹ năng Bắt buộc (Phẩy để tách)">
//                     <input
//                       type="text"
//                       {...register("mustHaveSkills")}
//                       placeholder="React, Node.js, SQL..."
//                       className="input-base w-full text-xs bg-background"
//                     />
//                   </FieldWrapper>

//                   <FieldWrapper label="Kỹ năng Ưu tiên">
//                     <input
//                       type="text"
//                       {...register("niceToHaveSkills")}
//                       placeholder="Docker, AWS, UI/UX..."
//                       className="input-base w-full text-xs bg-background"
//                     />
//                   </FieldWrapper>

//                   <div className="grid grid-cols-2 gap-3">
//                     <FieldWrapper label="Hạn nộp CV">
//                       <input
//                         type="date"
//                         {...register("deadline")}
//                         className="input-base w-full text-xs bg-background"
//                       />
//                     </FieldWrapper>
//                     <FieldWrapper label="Địa điểm">
//                       <input
//                         type="text"
//                         {...register("location")}
//                         placeholder="TP. HCM..."
//                         className="input-base w-full text-xs bg-background"
//                       />
//                     </FieldWrapper>
//                     <FieldWrapper label="Trình độ học vấn">
//                       <input
//                         type="text"
//                         {...register("educationLevel")}
//                         placeholder="Đại học..."
//                         className="input-base w-full text-xs bg-background"
//                       />
//                     </FieldWrapper>
//                     <FieldWrapper label="Giới tính">
//                       <select
//                         {...register("gender")}
//                         className="input-base w-full text-xs bg-background"
//                       >
//                         <option value="">Không yêu cầu</option>
//                         <option value="Nam">Nam</option>
//                         <option value="Nữ">Nữ</option>
//                       </select>
//                     </FieldWrapper>
//                     <FieldWrapper label="Độ tuổi">
//                       <input
//                         type="text"
//                         {...register("ageRange")}
//                         placeholder="VD: 22-30"
//                         className="input-base w-full text-xs bg-background"
//                       />
//                     </FieldWrapper>
//                     <FieldWrapper label="Ngoại ngữ">
//                       <input
//                         type="text"
//                         {...register("languages")}
//                         placeholder="Tiếng Anh giao tiếp"
//                         className="input-base w-full text-xs bg-background"
//                       />
//                     </FieldWrapper>
//                   </div>

//                   <FieldWrapper label="Phúc lợi Công ty (AI tham khảo)">
//                     <textarea
//                       {...register("companyBenefits")}
//                       rows={3}
//                       placeholder="- Lương tháng 13&#10;- Khám sức khỏe định kỳ..."
//                       className="input-base w-full text-xs resize-none bg-background"
//                     />
//                   </FieldWrapper>
//                 </fieldset>
//               </div>
//             </HorizontalDetailAccordion>

//             {/* 2. HORIZONTAL ACCORDION: NỘI DUNG JOB DESCRIPTION & PREVIEWS */}
//             <HorizontalDetailAccordion
//               title="Job Description & Đăng tuyển"
//               icon={<FileText size={14} />}
//               badge={
//                 request.aiDraftedDescription ? (
//                   <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold">
//                     Drafted
//                   </span>
//                 ) : undefined
//               }
//               isExpanded={openOrder.includes("jd")}
//               onToggle={() => togglePanel("jd")}
//               expandedWidth="lg:w-[680px]"
//             >
//               <div className="flex flex-col h-full space-y-4">
//                 {/* View Mode Switching Toolbar */}
//                 <div className="flex items-center justify-between p-2 rounded-lg bg-card border border-border shrink-0 gap-2">
//                   <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider pl-1">
//                     Chế độ xem
//                   </span>
//                   <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-md border border-border/50">
//                     <button
//                       type="button"
//                       onClick={() => setViewMode("edit")}
//                       className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded transition-all whitespace-nowrap ${
//                         viewMode === "edit"
//                           ? "bg-white shadow text-foreground"
//                           : "text-muted-foreground hover:text-foreground hover:bg-white/50"
//                       }`}
//                     >
//                       <Edit3 size={13} /> MD Editor
//                     </button>
//                     <button
//                       type="button"
//                       onClick={() => setViewMode("preview_board")}
//                       className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded transition-all whitespace-nowrap ${
//                         viewMode === "preview_board"
//                           ? "bg-emerald-600 text-white shadow"
//                           : "text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50"
//                       }`}
//                     >
//                       <LayoutTemplate size={13} /> Job Board
//                     </button>
//                     <button
//                       type="button"
//                       onClick={() => setViewMode("preview_fb")}
//                       className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded transition-all whitespace-nowrap ${
//                         viewMode === "preview_fb"
//                           ? "bg-[#1877F2] text-white shadow"
//                           : "text-muted-foreground hover:text-[#1877F2] hover:bg-blue-50"
//                       }`}
//                     >
//                        Facebook
//                     </button>
//                     <button
//                       type="button"
//                       onClick={() => setViewMode("preview_linkedin")}
//                       className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded transition-all whitespace-nowrap ${
//                         viewMode === "preview_linkedin"
//                           ? "bg-[#0A66C2] text-white shadow"
//                           : "text-muted-foreground hover:text-[#0A66C2] hover:bg-blue-50"
//                       }`}
//                     >
//                       LinkedIn
//                     </button>
//                   </div>
//                 </div>

//                 {/* Editor or Previews */}
//                 <div className="flex-1 flex flex-col min-h-0">
//                   {viewMode === "edit" ? (
//                     <div className="flex-1 flex flex-col space-y-3 min-h-0">
//                       {isEditable && (
//                         <div className="flex items-center gap-2 p-2 bg-indigo-50/70 border border-indigo-100 rounded-lg shadow-sm shrink-0">
//                           <Sparkles
//                             size={16}
//                             className="text-indigo-600 ml-1 shrink-0"
//                           />
//                           <input
//                             {...register("aiPrompt")}
//                             placeholder="Prompt tùy chỉnh bổ sung cho AI (tùy chọn)..."
//                             className="flex-1 bg-transparent border-none text-xs focus:ring-0 px-2 text-indigo-950 placeholder:text-indigo-300"
//                             disabled={isGenerating}
//                           />
//                           <ActionButton
//                             variant="primary"
//                             className="text-xs bg-indigo-600 hover:bg-indigo-700 h-8 shrink-0 shadow-sm"
//                             onClick={handleGenerateAI}
//                             disabled={isGenerating}
//                           >
//                             <Sparkles size={13} className="mr-1.5" /> Sinh JD
//                             bằng AI
//                           </ActionButton>
//                         </div>
//                       )}

//                       <textarea
//                         {...register("aiDraftedDescription")}
//                         disabled={!isEditable}
//                         className="w-full flex-1 min-h-[460px] p-4 bg-card border border-border rounded-xl text-xs font-mono leading-relaxed focus:ring-1 focus:ring-primary focus:border-primary resize-y shadow-inner custom-scrollbar"
//                         placeholder="Nội dung Markdown JD sẽ hiển thị ở đây. Bạn có thể tự do chỉnh sửa..."
//                       />
//                     </div>
//                   ) : viewMode === "preview_board" ? (
//                     <JobBoardPreview
//                       formValues={watch()}
//                       jobTitle={request.jobTitle}
//                       department={request.department}
//                     />
//                   ) : viewMode === "preview_fb" ? (
//                     <FacebookPreview
//                       formValues={watch()}
//                       jobTitle={request.jobTitle}
//                       department={request.department}
//                     />
//                   ) : (
//                     <LinkedInPreview
//                       formValues={watch()}
//                       jobTitle={request.jobTitle}
//                       department={request.department}
//                     />
//                   )}
//                 </div>
//               </div>
//             </HorizontalDetailAccordion>

//             {/* 3. HORIZONTAL ACCORDION: THÔNG SỐ & TIẾN ĐỘ */}
//             <HorizontalDetailAccordion
//               title="Thông số & Tiến độ"
//               icon={<ActivitySquare size={14} />}
//               isExpanded={openOrder.includes("stats")}
//               onToggle={() => togglePanel("stats")}
//               expandedWidth="lg:w-[360px]"
//             >
//               <div className="space-y-4">
//                 <p className="text-xs text-muted-foreground leading-relaxed">
//                   Trạng thái vận hành và các mốc thời gian của yêu cầu tuyển
//                   dụng.
//                 </p>

//                 <div className="bg-card rounded-xl border border-border/60 p-4 space-y-3">
//                   <div className="flex justify-between items-center py-1 border-b border-border/50">
//                     <span className="text-[11px] text-muted-foreground">
//                       Trạng thái hiện tại
//                     </span>
//                     <span
//                       className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${currentStatus.bg} ${currentStatus.text}`}
//                     >
//                       {currentStatus.label}
//                     </span>
//                   </div>
//                   <div className="flex justify-between items-center py-1 border-b border-border/50">
//                     <span className="text-[11px] text-muted-foreground">
//                       Ngày khởi tạo
//                     </span>
//                     <span className="text-xs font-medium text-foreground">
//                       {request.createdAt
//                         ? new Date(request.createdAt).toLocaleDateString(
//                             "vi-VN",
//                           )
//                         : "—"}
//                     </span>
//                   </div>
//                   <div className="flex justify-between items-center py-1">
//                     <span className="text-[11px] text-muted-foreground">
//                       Tình trạng JD (AI)
//                     </span>
//                     <span
//                       className={`text-xs font-semibold ${
//                         request.aiDraftedDescription
//                           ? "text-emerald-600"
//                           : "text-muted-foreground"
//                       }`}
//                     >
//                       {request.aiDraftedDescription
//                         ? "Đã có bản nháp"
//                         : "Chưa tạo"}
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             </HorizontalDetailAccordion>

//             {/* 4. HORIZONTAL ACCORDION: JD MẪU GỢI Ý */}
//             {isEditable && (
//               <HorizontalDetailAccordion
//                 title="JD Mẫu Gợi ý"
//                 icon={<Copy size={14} />}
//                 isExpanded={openOrder.includes("suggestions")}
//                 onToggle={() => togglePanel("suggestions")}
//                 expandedWidth="lg:w-[380px]"
//               >
//                 <div className="space-y-4">
//                   <p className="text-xs text-muted-foreground leading-relaxed">
//                     Tái sử dụng nội dung mô tả công việc từ các vị trí tương
//                     đồng đã từng tuyển thành công trong hệ thống.
//                   </p>

//                   <ActionButton
//                     variant="secondary"
//                     className="w-full text-xs h-9"
//                     onClick={() => setShowCloneModal(true)}
//                     disabled={isGenerating}
//                   >
//                     <Copy size={13} className="mr-1.5" /> Mở Thư viện Mẫu
//                   </ActionButton>
//                 </div>
//               </HorizontalDetailAccordion>
//             )}

//             {/* 5. HORIZONTAL ACCORDION: KÊNH ĐĂNG TUYỂN (PUBLISH) */}
//             {isApproved && (
//               <HorizontalDetailAccordion
//                 title="Kênh Đăng tuyển"
//                 icon={<Globe size={14} />}
//                 badge={
//                   <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold">
//                     {selectedPlatforms.length}
//                   </span>
//                 }
//                 isExpanded={openOrder.includes("publish")}
//                 onToggle={() => togglePanel("publish")}
//                 expandedWidth="lg:w-[380px]"
//               >
//                 <div className="space-y-4">
//                   <p className="text-xs text-muted-foreground leading-relaxed">
//                     Chọn các cổng việc làm và lịch biểu phân phối chiến dịch
//                     tuyển dụng.
//                   </p>

//                   <div className="bg-card rounded-xl border border-border/60 p-4 space-y-4">
//                     <div>
//                       <label className="text-[10px] font-bold text-muted-foreground uppercase mb-2 block">
//                         Cổng đăng tin
//                       </label>
//                       <div className="flex flex-col gap-2">
//                         {PLATFORMS.map((p) => (
//                           <label
//                             key={p}
//                             className="flex items-center gap-2 text-xs text-foreground cursor-pointer select-none"
//                           >
//                             <input
//                               type="checkbox"
//                               checked={selectedPlatforms.includes(p)}
//                               onChange={() =>
//                                 setSelectedPlatforms((prev) =>
//                                   prev.includes(p)
//                                     ? prev.filter((x) => x !== p)
//                                     : [...prev, p],
//                                 )
//                               }
//                               className="rounded accent-emerald-600"
//                             />
//                             {p}
//                           </label>
//                         ))}
//                       </div>
//                     </div>

//                     <div className="pt-3 border-t border-border/50">
//                       <label className="text-[10px] font-bold text-muted-foreground uppercase mb-2 flex items-center gap-2 cursor-pointer select-none">
//                         <input
//                           type="checkbox"
//                           checked={isScheduled}
//                           onChange={(e) => setIsScheduled(e.target.checked)}
//                           className="rounded accent-emerald-600"
//                         />
//                         Hẹn giờ đăng tin
//                       </label>
//                       {isScheduled && (
//                         <input
//                           type="datetime-local"
//                           value={scheduleTime}
//                           onChange={(e) => setScheduleTime(e.target.value)}
//                           className="input-base w-full text-xs border-emerald-200 mt-1"
//                         />
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               </HorizontalDetailAccordion>
//             )}
//           </>
//         }
//         /* ─── FOOTER ACTIONS ─── */
//         footer={
//           <>
//             {isEditable && (
//               <ActionButton
//                 variant="outline"
//                 className="mr-auto text-xs px-4"
//                 onClick={handleSubmit(handleSaveDraft)}
//                 isLoading={isUpdating}
//                 disabled={isGenerating}
//               >
//                 <Save size={14} className="mr-1.5" /> Lưu Nháp
//               </ActionButton>
//             )}

//             {isEditable && request.aiDraftedDescription && (
//               <ActionButton
//                 variant="primary"
//                 className="text-xs px-5"
//                 onClick={() => requestApproval(requestId)}
//                 isLoading={isRequestingApprove}
//                 disabled={isGenerating}
//               >
//                 <Send size={14} className="mr-1.5" /> Trình Duyệt
//               </ActionButton>
//             )}

//             {isPendingApproval && (
//               <>
//                 <ActionButton
//                   variant="secondary"
//                   className="mr-auto text-xs bg-purple-100 text-purple-700 hover:bg-purple-200 border-none px-4"
//                   onClick={() => forceApprove(requestId)}
//                   isLoading={isForceApproving}
//                   requireConfirm
//                   confirmTitle="Ép Duyệt?"
//                   confirmMessage="Bỏ qua Trưởng phòng và tự động duyệt Yêu cầu này?"
//                   confirmLabel="Ép Duyệt"
//                 >
//                   <ShieldCheck size={14} className="mr-1.5" /> Ép Duyệt (HR
//                   Bypass)
//                 </ActionButton>
//                 <ActionButton
//                   variant="primary"
//                   className="text-xs bg-emerald-600 hover:bg-emerald-700 px-5"
//                   onClick={() => approveRequest(requestId)}
//                   isLoading={isApproving}
//                 >
//                   <CheckCircle2 size={14} className="mr-1.5" /> Phê Duyệt (Dept
//                   Head)
//                 </ActionButton>
//               </>
//             )}

//             {isApproved && (
//               <ActionButton
//                 variant="primary"
//                 className="text-xs bg-emerald-600 hover:bg-emerald-700 px-5"
//                 onClick={handlePublish}
//                 isLoading={isPublishing}
//               >
//                 <Globe size={14} className="mr-1.5" /> Xuất bản (
//                 {selectedPlatforms.length} kênh)
//               </ActionButton>
//             )}
//           </>
//         }
//       >
//         {/* ─── CỘT 2: CANVAS CHÍNH (EXPANDED WORKSPACE CANVAS) ─── */}
//         <div className="p-6 md:p-10 max-w-3xl mx-auto space-y-6 relative h-full flex flex-col justify-center text-center">
//           {/* Overlay khi AI đang xử lý */}
//           {isGenerating && (
//             <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-card/70 backdrop-blur-sm rounded-xl">
//               <div className="w-16 h-16 bg-white rounded-full shadow-2xl flex items-center justify-center mb-4 border border-indigo-100">
//                 <Sparkles size={32} className="text-indigo-500 animate-pulse" />
//               </div>
//               <h3 className="text-base font-bold text-indigo-700 animate-pulse">
//                 AI đang xử lý yêu cầu...
//               </h3>
//               <p className="text-xs text-indigo-600/70 mt-2 text-center">
//                 Đang tổng hợp thông tin từ Form cấu trúc
//                 <br />
//                 và soạn thảo bản thảo JD chuyên nghiệp
//               </p>
//             </div>
//           )}

//           {/* Hướng dẫn không gian làm việc side-by-side */}
//           <div className="bg-card rounded-2xl border border-border p-8 shadow-sm space-y-5">
//             <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
//               <SlidersHorizontal size={28} />
//             </div>
//             <div>
//               <span className="text-[11px] font-bold uppercase tracking-widest text-primary">
//                 Không gian làm việc tương tác Side-by-Side
//               </span>
//               <h2 className="text-2xl font-bold text-foreground mt-1">
//                 {request.jobTitle}
//               </h2>
//               <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
//                 Bấm vào các thẻ nhãn dọc ở cạnh phải để mở đồng thời tối đa 2
//                 bảng điều chỉnh: **Dữ liệu Cấu trúc** hoặc **Job Description &
//                 Đăng tuyển**.
//               </p>
//             </div>

//             <div className="flex items-center justify-center gap-3 pt-2">
//               <ActionButton
//                 variant="outline"
//                 className="text-xs px-4"
//                 onClick={() => togglePanel("structure")}
//               >
//                 <Layers size={14} className="mr-1.5" />
//                 {openOrder.includes("structure")
//                   ? "Đóng Dữ liệu Cấu trúc"
//                   : "Mở Dữ liệu Cấu trúc"}
//               </ActionButton>
//               <ActionButton
//                 variant="primary"
//                 className="text-xs px-4 bg-indigo-600 hover:bg-indigo-700"
//                 onClick={() => togglePanel("jd")}
//               >
//                 <FileText size={14} className="mr-1.5" />
//                 {openOrder.includes("jd") ? "Đóng JD Editor" : "Mở JD Editor"}
//               </ActionButton>
//             </div>
//           </div>
//         </div>
//       </HorizontalDetailLayout>

//       {/* ── MODAL GỢI Ý CLONE JD ── */}
//       {showCloneModal && (
//         <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
//           <div className="bg-card rounded-xl border border-border shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
//             <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-muted/10">
//               <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
//                 <Copy size={16} className="text-primary" /> Mẫu JD Gợi ý từ Hệ
//                 thống
//               </h3>
//               <button
//                 onClick={() => setShowCloneModal(false)}
//                 className="p-1.5 rounded hover:bg-muted text-muted-foreground"
//               >
//                 <X size={16} />
//               </button>
//             </div>
//             <div className="p-5 overflow-y-auto space-y-3 custom-scrollbar flex-1">
//               {loadingSuggestions ? (
//                 <div className="flex justify-center p-8">
//                   <Loader2 className="animate-spin text-primary" />
//                 </div>
//               ) : suggestionsRes?.data?.length > 0 ? (
//                 suggestionsRes.data.map((sg: any) => (
//                   <div
//                     key={sg.id}
//                     className="border border-border rounded-lg p-4 hover:border-primary/50 transition-colors bg-muted/10"
//                   >
//                     <div className="flex justify-between items-start mb-2">
//                       <div>
//                         <h4 className="text-sm font-bold text-foreground">
//                           {sg.publicTitle}
//                         </h4>
//                         <p className="text-[10px] text-muted-foreground mt-0.5">
//                           Sử dụng lần cuối:{" "}
//                           {new Date(sg.updatedAt).toLocaleDateString("vi-VN")}
//                         </p>
//                       </div>
//                       <ActionButton
//                         variant="secondary"
//                         className="text-[10px] h-7 px-3 border-primary/20 text-primary hover:bg-primary hover:text-white"
//                         onClick={() => handleClone(sg.id)}
//                         isLoading={isCloning}
//                       >
//                         Sử dụng mẫu này
//                       </ActionButton>
//                     </div>
//                     <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
//                       {sg.aiDraftedDescription}
//                     </p>
//                   </div>
//                 ))
//               ) : (
//                 <p className="text-center text-xs text-muted-foreground italic p-8">
//                   Không tìm thấy JD mẫu nào phù hợp với chức danh này.
//                 </p>
//               )}
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }
