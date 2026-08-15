import type { ContentEntitlement } from "@/data/types";

export function entitlementKey(subjectSlug: string, seriesSlug: string): string {
  return `${subjectSlug}:${seriesSlug}`;
}

export function contentAccessKey(content: ContentEntitlement): string {
  return content.accessKey || entitlementKey(content.subjectSlug, content.seriesSlug);
}

export function hasContentAccess(content: ContentEntitlement, keys: string[]): boolean {
  return keys.includes(contentAccessKey(content));
}
