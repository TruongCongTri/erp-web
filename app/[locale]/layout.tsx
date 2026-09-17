// app/[locale]/layout.tsx
import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "@/app/globals.css";
import { env } from "@/lib/env";
import { NextIntlClientProvider } from "next-intl";
import {
  getMessages,
  getTranslations,
  setRequestLocale,
} from "next-intl/server";
import { StoreProvider } from "@/lib/store/StoreProvider";
import { routing } from "@/i18n/routing";
import { notFound } from "next/navigation";
import { TooltipProvider } from "@/components/ui/tooltip";
import { GooeyToaster } from "@/components/ui/goey-toaster";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-plus-jakarta-sans",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

type LocaleLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: LocaleLayoutProps): Promise<Metadata> {
  const { locale } = await params;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!routing.locales.includes(locale as any)) notFound();
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "Metadata" });

  return {
    metadataBase: new URL(env.NEXT_PUBLIC_URL),
    title: {
      default: t("title"),
      template: t("template"),
    },
    description: t("description"),
    openGraph: {
      type: "website",
      locale: locale === "vi" ? "vi_VN" : "en_US",
      url: env.NEXT_PUBLIC_URL,
      siteName: "Chinh Nam",
      images: [{ url: "./icon.png", width: 1200, height: 630 }],
    },
    alternates: {
      canonical: "./",
      languages: {
        en: "/en",
        vi: "/vi",
      },
    },
  };
}

export default async function LocaleLayout(props: LocaleLayoutProps) {
  const params = await props.params;
  const locale = params.locale;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    // suppressHydrationWarning on HTML is good for dark mode scripts (like next-themes)
    // <html lang={locale} suppressHydrationWarning data-scroll-behavior="smooth">
    <div
      className={`${plusJakartaSans.variable} ${plusJakartaSans.className} min-h-screen flex flex-col bg-background font-sans text-foreground antialiased`}
    >
      <TooltipProvider>
        <GooeyToaster
          position="top-right"
          richColors
          closeButton
          preset="smooth"
          // showProgress
        />

        <StoreProvider>
          <NextIntlClientProvider messages={messages} locale={locale}>
            {props.children}
          </NextIntlClientProvider>
        </StoreProvider>
      </TooltipProvider>
    </div>
    // </html>
  );
}
