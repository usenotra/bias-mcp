import { EDITORIAL_PATH_PATTERN, PRODUCT_PATH_PATTERN } from "../constants/bias.js";
import type { SitePageSample } from "../types/site.js";

function pathOf(url: string): string {
  try {
    return new URL(url).pathname;
  } catch {
    return "";
  }
}

export function editorialShare(pages: SitePageSample[]): number {
  const paths = pages.map((p) => pathOf(p.url)).filter((p) => p.length > 1);
  if (paths.length === 0) return 0;
  return Math.round((paths.filter((p) => EDITORIAL_PATH_PATTERN.test(p)).length / paths.length) * 100) / 100;
}

export function productPages(pages: SitePageSample[]): string[] {
  return pages.map((p) => p.url).filter((url) => PRODUCT_PATH_PATTERN.test(pathOf(url)));
}

export function isAboutPage(url: string): boolean {
  return /\/(about|about-us|who-we-are|team|imprint|impressum)(\/|$)/i.test(pathOf(url));
}
