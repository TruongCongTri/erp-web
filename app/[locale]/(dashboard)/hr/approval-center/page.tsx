'use client';
import ApprovalCenterContent from '@/components/hr/ApprovalCenterContent';
import React, { use } from 'react';

interface Props {
  params: Promise<{ locale: string }>;
}

export default function ApprovalCenterPage({ params }: Props) {
  const { locale } = use(params);
  return <ApprovalCenterContent locale={locale} />;
}
