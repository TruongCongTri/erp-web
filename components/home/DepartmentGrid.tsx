'use client';
import React from 'react';
import Link from 'next/link';
import {
  Boxes, AlertTriangle, UserCheck, HeartHandshake, TrendingUp,
  Pen, Calculator, HardHat, Radio, DollarSign, ShoppingCart, UserCog
} from 'lucide-react';

const departments = [
  { id: 'dept-vl', name: 'Phòng Vật lực', icon: <Boxes size={20} />, count: 12, color: 'bg-orange-50 border-orange-200 text-orange-700', href: '#' },
  { id: 'dept-at', name: 'An toàn & QLCL', icon: <AlertTriangle size={20} />, count: 8, color: 'bg-red-50 border-red-200 text-red-700', href: '#' },
  { id: 'dept-nl', name: 'Quản lý Nhân lực', icon: <UserCheck size={20} />, count: 5, color: 'bg-green-50 border-green-200 text-green-700', href: '/employee-management' },
  { id: 'dept-cskh', name: 'Chăm sóc KH', icon: <HeartHandshake size={20} />, count: 15, color: 'bg-pink-50 border-pink-200 text-pink-700', href: '#' },
  { id: 'dept-kd', name: 'Kinh doanh', icon: <TrendingUp size={20} />, count: 9, color: 'bg-blue-50 border-blue-200 text-blue-700', href: '#' },
  { id: 'dept-tk', name: 'Khối Thiết kế', icon: <Pen size={20} />, count: 22, color: 'bg-purple-50 border-purple-200 text-purple-700', href: '#' },
  { id: 'dept-dt', name: 'Phòng Dự toán', icon: <Calculator size={20} />, count: 7, color: 'bg-indigo-50 border-indigo-200 text-indigo-700', href: '#' },
  { id: 'dept-xd', name: 'Xây dựng', icon: <HardHat size={20} />, count: 45, color: 'bg-yellow-50 border-yellow-200 text-yellow-700', href: '#' },
  { id: 'dept-tt', name: 'Truyền thông', icon: <Radio size={20} />, count: 6, color: 'bg-cyan-50 border-cyan-200 text-cyan-700', href: '#' },
  { id: 'dept-kt', name: 'Phòng Kế toán', icon: <DollarSign size={20} />, count: 11, color: 'bg-emerald-50 border-emerald-200 text-emerald-700', href: '#' },
  { id: 'dept-cu', name: 'Phòng Cung ứng', icon: <ShoppingCart size={20} />, count: 8, color: 'bg-teal-50 border-teal-200 text-teal-700', href: '#' },
  { id: 'dept-hc', name: 'Hành chính NS', icon: <UserCog size={20} />, count: 10, color: 'bg-slate-50 border-slate-200 text-slate-700', href: '/role-permission-matrix-ph-n-quy-n' },
];

export default function DepartmentGrid() {
  return (
    <div className="card p-4">
      <h3 className="text-sm font-semibold text-foreground mb-3">Phòng ban</h3>
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
        {departments?.map(dept => (
          <Link
            key={dept?.id}
            href={dept?.href}
            className={`flex flex-col items-center gap-2 p-3 rounded-lg border cursor-pointer hover:shadow-md transition-all duration-150 active:scale-95 ${dept?.color}`}
          >
            <div>{dept?.icon}</div>
            <p className="text-[11px] font-medium text-center leading-tight">{dept?.name}</p>
            <p className="text-[10px] font-semibold opacity-70">{dept?.count} NV</p>
          </Link>
        ))}
      </div>
    </div>
  );
}