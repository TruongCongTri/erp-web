import React from 'react';

interface KpiCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  trend?: { value: string; positive: boolean };
  icon: React.ReactNode;
  accent?: 'green' | 'amber' | 'red' | 'blue';
}

const accentMap = {
  green: 'bg-green-50 text-green-700 border-green-200',
  amber: 'bg-amber-50 text-amber-700 border-amber-200',
  red: 'bg-red-50 text-red-700 border-red-200',
  blue: 'bg-blue-50 text-blue-700 border-blue-200',
};

const iconAccentMap = {
  green: 'bg-green-100 text-green-700',
  amber: 'bg-amber-100 text-amber-700',
  red: 'bg-red-100 text-red-700',
  blue: 'bg-blue-100 text-blue-700',
};

export default function KpiCard({ label, value, subtext, trend, icon, accent = 'green' }: KpiCardProps) {
  return (
    <div className={`card p-4 flex flex-col gap-3 border ${accentMap[accent]}`}>
      <div className="flex items-start justify-between">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${iconAccentMap[accent]}`}>
          {icon}
        </div>
        {trend && (
          <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${trend.positive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {trend.positive ? '↑' : '↓'} {trend.value}
          </span>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold tabular-nums text-foreground">{value}</p>
        <p className="text-xs font-medium text-muted-foreground mt-0.5">{label}</p>
        {subtext && <p className="text-[11px] text-muted-foreground mt-1">{subtext}</p>}
      </div>
    </div>
  );
}