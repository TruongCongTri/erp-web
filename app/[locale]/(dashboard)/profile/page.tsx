"use client";
import PersonalProfileContent from "@/components/profile/PersonalProfileContent";
import ProfileContent from "@/components/profile/ProfileContent";
import React, { use } from "react";

interface Props {
  params: Promise<{ locale: string }>;
}

export default function PersonalProfilePage({ params }: Props) {
  const { locale } = use(params);
  return <ProfileContent />;
}
