'use client';
import React from 'react';
import dynamic from 'next/dynamic';

const BarChartComponent = dynamic(() => import('./HeadcountChartInner'), { ssr: false });

export default function HeadcountChart() {
  return <BarChartComponent />;
}