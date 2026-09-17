'use client';
import InterviewTrackerContent from '@/components/hr/InterviewTrackerContent';
import React, { use } from 'react';

interface Props {
  params: Promise<{ locale: string }>;
}

export default function InterviewTrackerPage({ params }: Props) {
  const { locale } = use(params);
  return <InterviewTrackerContent locale={locale} />;
}
