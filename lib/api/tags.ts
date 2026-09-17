// lib/api/tags.ts

// 1. Define the array of all valid tags (used by the Slice)
export const ERP_TAGS = ['Employees', 'Newsfeed'] as const;

// 2. Extract a strict TypeScript type from the array (used by the Strategies)
export type ERPTagType = typeof ERP_TAGS[number]; // Resolves exactly to: "Employees" | "Newsfeed"