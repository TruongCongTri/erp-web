// i18n.ts
import { getRequestConfig } from "next-intl/server";
import { routing } from "./i18n/routing";

export default getRequestConfig(async ({ requestLocale }) => {
  // 1. Await the locale safely
  let locale = await requestLocale;

  // 2. Fallback logic
  if (!locale || !routing.locales.includes(locale as any)) {
    console.warn(`Invalid locale detected: ${locale}. Falling back to '${routing.defaultLocale}'.`);
    locale = routing.defaultLocale; 
  }

  return {
    locale, 
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});