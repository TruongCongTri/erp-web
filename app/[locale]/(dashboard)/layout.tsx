// app/[locale]/(dashboard)/dashboard/layout.tsx
import { redirect } from "next/navigation";
import { ServerAPI } from "@/lib/api/server-api"; // Uses our server-fetch strategy
import AppLayout from "@/components/layouts/AppLayout";
import { AuthUser } from "@/types/modelsver2";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  let user: AuthUser;

  try {
    // 1. Fetch the user profile securely on the server
    // ServerAPI.getMe() must use 'serverFetch' which reads the cookie
    user = await ServerAPI.getMe(); 
  } catch (error) {
    // 2. If the API returns 401 (invalid/expired token), kick them out
    redirect(`/${locale}/login`);
  }

  // 3. Optional: Pass the authenticated user to the Client Layout
  // so the Sidebar and Topbar can display their name/avatar
  return (
    <AppLayout user={user}>
      <div className="flex flex-col flex-1 min-h-0 overflow-hidden h-full">
        {children}
      </div>
    </AppLayout>
  );
}