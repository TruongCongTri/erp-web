/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Shield,
  Building2,
  HardHat,
  Wrench,
  AlertTriangle,
  UserCheck,
  HeartHandshake,
  Pen,
  Calculator,
  Radio,
  DollarSign,
  ShoppingCart,
  UserCog,
  ChevronRight,
  Bell,
  Boxes,
  ClipboardList,
  BarChart3,
  CalendarCheck,
  CheckSquare,
  FileSearch,
  ArrowLeft,
  Briefcase,
  FileText,
  BookOpen,
  Network,
  Globe,
  Ticket,
} from "lucide-react";

import AppImage from "../ui/AppImage";
import { usePermissions } from "@/hooks/usePermissions";
import { AuthUser } from "@/types/modelsver2";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";
import { useGetNotificationsQuery } from "@/lib/store/notificationsApiSlice";

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
  badge?: number;
  resourceSlug?: string;
  children?: NavItem[];
}

interface DeptGroup {
  groupLabel: string;
  items: NavItem[];
}

const topNavItems: NavItem[] = [
  {
    id: "news_feed",
    label: "Bảng tin (Dashboard)",
    icon: <LayoutDashboard size={18} />,
    href: "/vi/dashboard",
    resourceSlug: "news_feed",
  },
  {
    id: "tasks",
    label: "Công việc (Tasks)",
    icon: <CheckSquare size={18} />,
    href: "/vi/under-development",
    resourceSlug: "task",
  },
  {
    id: "meetings",
    label: "Lịch họp (Meetings)",
    icon: <CalendarCheck size={18} />,
    href: "/vi/under-development",
    resourceSlug: "meeting",
  },
  {
    id: "tickets",
    label: "Yêu cầu hỗ trợ (Tickets)",
    icon: <Ticket size={18} />,
    href: "/vi/tickets",
  },
  {
    id: "notifications",
    label: "Thông báo",
    icon: <Bell size={18} />,
    href: "/vi/notifications",
    // badge được gán động từ số thông báo chưa đọc (xem `filteredTopNavItems`)
  },
  {
    id: "home",
    label: "Trang chính",
    icon: <Globe size={18} />,
    href: "/vi",
  },
];

const deptGroups: DeptGroup[] = [
  {
    groupLabel: "Core EPC Pipeline",
    items: [
      {
        id: "project",
        label: "Quản lý Dự án",
        resourceSlug: "project",
        icon: <Briefcase size={18} />,
        children: [
          {
            id: "pj-overview",
            label: "Tổng quan",
            icon: <BarChart3 size={16} />,
            href: "/vi/under-development",
          },
          {
            id: "pj-milestone",
            label: "Milestones",
            icon: <CheckSquare size={16} />,
            href: "/vi/under-development",
          },
        ],
      },
      {
        id: "design",
        label: "Thiết kế (Arch/Struct)",
        resourceSlug: "design",
        icon: <Pen size={18} />,
        children: [
          {
            id: "ds-bim",
            label: "BIM Models",
            icon: <Building2 size={16} />,
            href: "/vi/under-development",
          },
          {
            id: "ds-blueprint",
            label: "Bản vẽ Kỹ thuật",
            icon: <FileSearch size={16} />,
            href: "/vi/under-development",
          },
        ],
      },
      {
        id: "mep",
        label: "Cơ điện (MEP)",
        resourceSlug: "mep",
        icon: <Wrench size={18} />,
        children: [
          {
            id: "mep-electrical",
            label: "Hệ thống điện",
            icon: <AlertTriangle size={16} />,
            href: "/vi/under-development",
          },
          {
            id: "mep-plumbing",
            label: "Hệ thống nước",
            icon: <Wrench size={16} />,
            href: "/vi/under-development",
          },
        ],
      },
      {
        id: "estimation",
        label: "Dự toán (Estimation)",
        resourceSlug: "estimation",
        icon: <Calculator size={18} />,
        children: [
          {
            id: "est-boq",
            label: "BOQ Generator",
            icon: <FileText size={16} />,
            href: "/vi/under-development",
          },
          {
            id: "est-budget",
            label: "Ngân sách mục tiêu",
            icon: <DollarSign size={16} />,
            href: "/vi/under-development",
          },
        ],
      },
      {
        id: "construction",
        label: "Thi công (Construction)",
        resourceSlug: "construction",
        icon: <HardHat size={18} />,
        children: [
          {
            id: "cs-diary",
            label: "Nhật ký công trình",
            icon: <ClipboardList size={16} />,
            href: "/vi/under-development",
          },
          {
            id: "cs-safety",
            label: "An toàn lao động",
            icon: <AlertTriangle size={16} />,
            href: "/vi/under-development",
          },
        ],
      },
      {
        id: "supply",
        label: "Cung ứng (Supply)",
        resourceSlug: "supply",
        icon: <ShoppingCart size={18} />,
        children: [
          {
            id: "sp-vendor",
            label: "Nhà cung cấp",
            icon: <Building2 size={16} />,
            href: "/vi/under-development",
          },
          {
            id: "sp-po",
            label: "Purchase Orders",
            icon: <FileText size={16} />,
            href: "/vi/under-development",
          },
        ],
      },
      {
        id: "asset",
        label: "Vật lực (Asset)",
        resourceSlug: "asset",
        icon: <Boxes size={18} />,
        children: [
          {
            id: "as-inventory",
            label: "Kho bãi",
            icon: <Boxes size={16} />,
            href: "/vi/under-development",
          },
          {
            id: "as-fleet",
            label: "Điều phối xe máy",
            icon: <Wrench size={16} />,
            href: "/vi/under-development",
          },
        ],
      },
    ],
  },
  {
    groupLabel: "Corporate Operations",
    items: [
      {
        id: "hr",
        label: "Hành chính Nhân sự",
        resourceSlug: "hr",
        icon: <Users size={18} />,
        children: [
          {
            id: "hr-employees",
            label: "Quản lý nhân viên",
            icon: <UserCheck size={16} />,
            href: "/vi/hr/employee-management",
          },
          {
            id: "hr-payroll",
            label: "Chấm công & Lương",
            icon: <DollarSign size={16} />,
            href: "/vi/under-development",
          },
          {
            id: "hr-leave",
            label: "Duyệt nghỉ phép",
            icon: <CalendarCheck size={16} />,
            href: "/vi/under-development",
            resourceSlug: "leave_request",
          },
          {
            id: "hr-profiles",
            label: "Quản lý hồ sơ",
            icon: <UserCheck size={16} />,
            href: "/vi/hr/profile-management",
          },
        ],
      },
      {
        id: "ats",
        label: "Tuyển dụng",
        icon: <Users size={18} />,
        children: [
          {
            id: "ats-request",
            label: "Quản lý yêu cầu tuyển dụng",
            icon: <UserCheck size={16} />,
            href: "/vi/ats/request-management",
          },
          {
            id: "ats-jobs",
            label: "Quản lý tin tuyển dụng",
            icon: <UserCheck size={16} />,
            href: "/vi/ats/jobs-management",
          },
          {
            id: "ats-candidates",
            label: "Quản lý ứng viên",
            icon: <UserCheck size={16} />,
            href: "/vi/ats/candidate-management",
          },
        ],
      },
      {
        id: "finance",
        label: "Tài chính Kế toán",
        resourceSlug: "finance",
        icon: <DollarSign size={18} />,
        children: [
          {
            id: "fn-cashflow",
            label: "Dòng tiền",
            icon: <BarChart3 size={16} />,
            href: "/vi/under-development",
          },
          {
            id: "fn-payable",
            label: "Thanh toán (AP/AR)",
            icon: <ClipboardList size={16} />,
            href: "/vi/under-development",
          },
        ],
      },
      {
        id: "crm",
        label: "Kinh doanh (CRM)",
        resourceSlug: "crm",
        icon: <HeartHandshake size={18} />,
        children: [
          {
            id: "crm-leads",
            label: "Leads / Khách hàng",
            icon: <Users size={16} />,
            href: "/vi/under-development",
          },
        ],
      },
      {
        id: "contract",
        label: "Hợp đồng (Contract)",
        resourceSlug: "contract",
        icon: <FileText size={18} />,
        children: [
          {
            id: "ct-sales",
            label: "Hợp đồng Kinh tế",
            icon: <FileText size={16} />,
            href: "/vi/under-development",
          },
          {
            id: "ct-sub",
            label: "Hợp đồng Thầu phụ",
            icon: <UserCog size={16} />,
            href: "/vi/under-development",
          },
        ],
      },
      {
        id: "media",
        label: "Truyền thông (Media)",
        resourceSlug: "media",
        icon: <Radio size={18} />,
        children: [
          {
            id: "md-news",
            label: "Tin tức nội bộ",
            icon: <Radio size={16} />,
            href: "/vi/under-development",
          },
          {
            id: "md-assets",
            label: "Tài sản thương hiệu",
            icon: <Boxes size={16} />,
            href: "/vi/under-development",
          },
        ],
      },
    ],
  },
  {
    groupLabel: "General Internal & IT",
    items: [
      {
        id: "document",
        label: "Tài liệu (EDMS)",
        resourceSlug: "document",
        icon: <FileSearch size={18} />,
        children: [
          {
            id: "doc-archive",
            label: "Lưu trữ chung",
            icon: <FileSearch size={16} />,
            href: "/vi/under-development",
          },
          {
            id: "doc-transmittal",
            label: "Transmittals",
            icon: <ClipboardList size={16} />,
            href: "/vi/under-development",
          },
        ],
      },
      {
        id: "report",
        label: "Báo cáo (BI)",
        resourceSlug: "report",
        icon: <BarChart3 size={18} />,
        children: [
          {
            id: "rp-dashboards",
            label: "Dashboards",
            icon: <LayoutDashboard size={16} />,
            href: "/vi/under-development",
          },
        ],
      },
      {
        id: "policy",
        label: "Chính sách & ISO",
        resourceSlug: "policy",
        icon: <BookOpen size={18} />,
        children: [
          {
            id: "pl-handbook",
            label: "Sổ tay nhân viên",
            icon: <BookOpen size={16} />,
            href: "/vi/under-development",
          },
          {
            id: "pl-iso",
            label: "Tiêu chuẩn ISO",
            icon: <FileText size={16} />,
            href: "/vi/under-development",
          },
        ],
      },
      {
        id: "it_system",
        label: "Hệ thống IT",
        resourceSlug: "it_system",
        icon: <Network size={18} />,
        children: [
          {
            id: "it-roles",
            label: "Phân quyền (Roles)",
            icon: <Shield size={16} />,
            href: "/vi/admin/role-permission-matrix",
          },
          {
            id: "it-resources",
            label: "Tài nguyên (Resources)",
            icon: <Boxes size={16} />,
            href: "/vi/admin/resources",
          },
          {
            id: "it-users-access",
            label: "Quyền truy cập của người dùng",
            icon: <Users size={16} />,
            href: "/vi/admin/users-access",
          },
          {
            id: "it-pending-claim-profile",
            label: "Quản lý Yêu cầu truy cập",
            icon: <Users size={16} />,
            href: "/vi/hr/pending-claim",
          },
          {
            id: "it-audit-log",
            label: "Nhật ký hệ thống",
            icon: <Users size={16} />,
            href: "/vi/audit-log",
          },
        ],
      },
      {
        id: "audit_log",
        label: "Nhật ký hệ thống",
        resourceSlug: "audit_log",
        icon: <ClipboardList size={18} />,
        children: [
          {
            id: "al-security",
            label: "Truy vết bảo mật",
            icon: <Shield size={16} />,
            href: "/vi/audit-log",
          },
        ],
      },
    ],
  },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
  user?: AuthUser | null;
}

const getInitials = (name?: string) => {
  if (!name) return "U";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export default function Sidebar({
  mobileOpen = false,
  onMobileClose,
  user: propsUser,
}: SidebarProps) {
  const pathname = usePathname();
  
  // Lấy trực tiếp user từ Redux Store để đảm bảo tính reactive khi Silent Refresh cập nhật state
  const reduxUser = useSelector((state: RootState) => state.auth.user);
  const user = propsUser || reduxUser;

  const { canAccessResource } = usePermissions();

  // Dùng chung cache RTK Query với chuông thông báo ở Topbar -> badge luôn khớp
  const { data: notifRes } = useGetNotificationsQuery(undefined, {
    skip: !user,
  });
  const unreadCount = useMemo(
    () => (notifRes?.data || []).filter((n) => !n.isRead).length,
    [notifRes],
  );

  const [isHovered, setIsHovered] = useState(false);
  const [activeDeptId, setActiveDeptId] = useState<string | null>(null);

  const activeDeptData = useMemo(() => {
    if (!activeDeptId) return null;
    for (const group of deptGroups) {
      const found = group.items.find((d) => d.id === activeDeptId);
      if (found) return found;
    }
    return null;
  }, [activeDeptId]);

  const isActive = (href?: string) => href && pathname === href;

  const initials = getInitials(user?.fullName || "CN");

  const renderItem = (item: NavItem, isDrilldownTrigger = false) => {
    const active = isActive(item.href);
    const content = (
      <>
        <div className="relative flex-shrink-0 flex items-center justify-center w-6 h-6">
          {item.icon}
          {!!item.badge && item.badge > 0 && (
            <span
              className={`absolute -top-1 -right-1 bg-red-500 rounded-full flex items-center justify-center text-white transition-all ${
                isHovered || mobileOpen
                  ? "w-4 h-4 text-[10px]"
                  : "w-2 h-2 text-[0px]"
              }`}
            >
              {isHovered || mobileOpen
                ? item.badge > 99
                  ? "99+"
                  : item.badge
                : ""}
            </span>
          )}
        </div>
        <div
          className={`flex flex-1 items-center justify-between whitespace-nowrap overflow-hidden transition-all duration-300 ${
            isHovered || mobileOpen ? "ml-3 opacity-100" : "ml-0 opacity-0 w-0"
          }`}
        >
          <span className="truncate">{item.label}</span>
          {isDrilldownTrigger && (
            <ChevronRight size={14} className="text-white/50 flex-shrink-0" />
          )}
        </div>
      </>
    );

    const baseClasses = `flex items-center px-3 py-2 mx-2 rounded-lg text-sm transition-all duration-200 group ${
      active
        ? "bg-white/15 text-white font-semibold"
        : "text-white/70 hover:bg-white/10 hover:text-white"
    }`;

    if (isDrilldownTrigger) {
      return (
        <button
          key={item.id}
          onClick={() => setActiveDeptId(item.id)}
          className={`w-[calc(100%-16px)] text-left ${baseClasses}`}
        >
          {content}
        </button>
      );
    }

    return (
      <Link
        key={item.id}
        href={item.href || "#"}
        onClick={onMobileClose}
        className={baseClasses}
      >
        {content}
      </Link>
    );
  };

  // Bổ sung user vào dependency array của useMemo để Sidebar tự động tính toán lại quyền khi token/user thay đổi
  const filteredTopNavItems = useMemo(() => {
    return topNavItems
      .filter((item) => {
        if (!item.resourceSlug) return true;

        if (user?.role?.slug === "SUPER_ADMIN") return true;
        return canAccessResource(item.resourceSlug);
      })
      .map((item) =>
        item.id === "notifications" ? { ...item, badge: unreadCount } : item,
      );
  }, [canAccessResource, user, unreadCount]);

  const filteredDeptGroups = useMemo(() => {
    return deptGroups
      .map((group) => {
        const filteredItems = group.items
          .filter((dept) => {
            if (!dept.resourceSlug) return true;
            if (user?.role?.slug === "SUPER_ADMIN") return true;
            return canAccessResource(dept.resourceSlug);
          })
          .map((dept) => {
            if (dept.children) {
              const filteredChildren = dept.children.filter((child) => {
                if (!child.resourceSlug) return true;
                if (user?.role?.slug === "SUPER_ADMIN") return true;
                return canAccessResource(child.resourceSlug);
              });
              return { ...dept, children: filteredChildren };
            }
            return dept;
          });

        return { ...group, items: filteredItems };
      })
      .filter((group) => group.items.length > 0);
  }, [canAccessResource, user]);

  const sidebarContent = (
    <aside
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`fixed top-0 left-0 h-full bg-primary text-white z-50 flex flex-col transition-all duration-300 ease-in-out ${
        isHovered || mobileOpen ? "w-64 shadow-2xl" : "w-16"
      } ${!mobileOpen ? "hidden md:flex" : "flex w-64"}`}
    >
      {/* Header / Logo */}
      <div className="flex items-center h-[var(--topbar-height,56px)] px-4 border-b border-white/10 flex-shrink-0 whitespace-nowrap overflow-hidden">
        <Link
          href="/vi/dashboard"
          onClick={onMobileClose}
          className="flex items-center group"
          title="Về Dashboard"
        >
          <AppImage
            src="/icon.png"
            alt="Logo"
            width={28}
            height={28}
            className="flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform"
          />
          <span
            className={`font-bold text-lg text-white ml-3 transition-opacity duration-300 ${
              isHovered || mobileOpen ? "opacity-100" : "opacity-0 hidden"
            }`}
          >
            Chính Nam
          </span>
        </Link>

        <Link
          href="/vi"
          onClick={onMobileClose}
          title="Về Website / Trang chủ chính"
          className={`p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-all ${
            isHovered || mobileOpen
              ? "opacity-100 flex"
              : "opacity-0 hidden pointer-events-none"
          }`}
        >
          <Globe size={16} />
        </Link>
      </div>

      {/* Top Nav */}
      <div className="flex-shrink-0 py-3 border-b border-white/10 space-y-1">
        {filteredTopNavItems.map((item) => renderItem(item))}
      </div>

      {/* Dept Nav */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide py-4 space-y-1">
        {!activeDeptId && (
          <>
            {filteredDeptGroups.map((group) => (
              <div key={`group-${group.groupLabel}`} className="mb-4">
                <div
                  className={`text-white/40 px-5 pb-2 text-[10px] uppercase font-bold tracking-wider transition-opacity duration-300 whitespace-nowrap ${
                    isHovered || mobileOpen ? "opacity-100" : "opacity-0 hidden"
                  }`}
                >
                  {group.groupLabel}
                </div>
                <div className="space-y-1">
                  {group.items.map((dept) => renderItem(dept, true))}
                </div>
              </div>
            ))}
          </>
        )}

        {/* Drill-down View */}
        {activeDeptId && activeDeptData && (
          <div className="fade-in">
            <button
              onClick={() => setActiveDeptId(null)}
              className={`w-[calc(100%-16px)] flex items-center px-3 py-2 mx-2 mb-4 rounded-lg text-sm text-white/60 hover:bg-white/10 hover:text-white transition-all whitespace-nowrap overflow-hidden ${
                isHovered || mobileOpen ? "opacity-100" : "justify-center"
              }`}
            >
              <ArrowLeft size={18} className="flex-shrink-0" />
              <span
                className={`ml-3 transition-all duration-300 ${
                  isHovered || mobileOpen ? "opacity-100 block" : "opacity-0 hidden"
                }`}
              >
                Về trang chủ
              </span>
            </button>

            <div
              className={`px-5 mb-4 border-l-2 border-accent transition-all duration-300 whitespace-nowrap overflow-hidden ${
                isHovered || mobileOpen
                  ? "opacity-100 block"
                  : "opacity-0 hidden"
              }`}
            >
              <h3 className="font-semibold text-white truncate">
                {activeDeptData.label}
              </h3>
              <p className="text-xs text-white/50 truncate">
                Phân hệ chức năng
              </p>
            </div>

            <div className="space-y-1">
              {activeDeptData.children?.map((child) => renderItem(child))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Profile */}
      <div className="h-[var(--topbar-height,56px)] flex-shrink-0 border-t border-white/10 p-3 whitespace-nowrap overflow-hidden flex items-center">
        <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mx-auto">
          {initials}
        </div>
        <div
          className={`ml-3 flex-1 min-w-0 transition-all duration-300 ${
            isHovered || mobileOpen ? "opacity-100 block" : "opacity-0 hidden"
          }`}
        >
          <p className="text-sm font-semibold text-white truncate">
            {user?.fullName || "User"}
          </p>
          <p className="text-xs text-white/50 truncate">
            {user?.email || "No email"}
          </p>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {sidebarContent}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden fade-in"
          onClick={onMobileClose}
        />
      )}
    </>
  );
}