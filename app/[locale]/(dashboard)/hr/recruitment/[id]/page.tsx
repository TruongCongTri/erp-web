import JobRecruitmentDetailContent from "@/components/ats/JobRecruitmentDetailContent";

interface Props {
  params: Promise<{ locale: string; id: string }>;
}

export default async function JobRecruitmentDetailPage({ params }: Props) {
  const { locale, id } = await params;
  return <JobRecruitmentDetailContent id={id} locale={locale} />;
}
