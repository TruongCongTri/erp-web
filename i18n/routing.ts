// routing.ts
import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ["en", "vi"],
  defaultLocale: "vi", 
});

// Export these so your components can use localized navigation
export const { Link, redirect, usePathname, useRouter } = createNavigation(routing);