import type { ContentEntitlement } from "@/data/types";

type FreeAccessibleContent = ContentEntitlement & { isFreeAccess?: boolean };

export function entitlementKey(subjectSlug: string, seriesSlug: string): string {
  return `${subjectSlug}:${seriesSlug}`;
}

export function contentAccessKey(content: ContentEntitlement): string {
  return content.accessKey || entitlementKey(content.subjectSlug, content.seriesSlug);
}

export function hasContentAccess(content: FreeAccessibleContent, keys: string[]): boolean {
  if (content.isFreeAccess) return true;
  return keys.includes(contentAccessKey(content));
}
