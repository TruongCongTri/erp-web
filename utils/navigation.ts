import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  // A list of all locales that are supported in your app
  locales: ['en', 'vi'],
  
  // Used when no locale matches
  defaultLocale: 'en',
  
  // Optional: 'always' (default) ensures /en/about, 'as-needed' leaves default as /about
  localePrefix: 'always' 
});

// Create and export the localized navigation APIs
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);