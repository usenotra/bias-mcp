export interface SitePageSample {
  url: string;
  title: string;
  snippet: string;
}

export interface SiteProfile {
  hostname: string;
  homepage: { url: string; title?: string; excerpt: string } | null;
  about: { url: string; excerpt: string } | null;
  pages: SitePageSample[];
  editorialShare: number;
  productPages: string[];
}
