import { SITE_ABOUT_CHARS, SITE_HOMEPAGE_CHARS, SITE_SAMPLE_RESULTS } from "../constants/bias.js";
import type { ProviderRouter } from "../providers/router.js";
import type { FetchedPage } from "../types/provider.js";
import type { SiteProfile } from "../types/site.js";
import { editorialShare, isAboutPage, productPages } from "../utils/site.js";
import { hostnameOf, normalizeUrl } from "../utils/url.js";

const cache = new Map<string, Promise<SiteProfile | null>>();

async function build(router: ProviderRouter, page: FetchedPage, hostname: string): Promise<SiteProfile | null> {
  const origin = `https://${hostname}/`;
  const isHome = normalizeUrl(page.url) === normalizeUrl(origin);

  const [sample, home] = await Promise.all([
    router
      .search({ query: `site:${hostname}`, numResults: SITE_SAMPLE_RESULTS }, [router.available[0]])
      .then((r) => r.results.filter((h) => hostnameOf(h.url) === hostname))
      .catch(() => []),
    isHome ? Promise.resolve(page) : router.fetch(origin, "auto").then((r) => r.page).catch(() => null),
  ]);

  const pages = sample.map(({ url, title, snippet }) => ({ url, title, snippet: snippet.slice(0, 300) }));
  const aboutUrl = pages.find((p) => isAboutPage(p.url))?.url;
  const about = aboutUrl
    ? await router.fetch(aboutUrl, "auto").then((r) => r.page).catch(() => null)
    : null;

  if (!home && pages.length === 0) return null;
  return {
    hostname,
    homepage: home ? { url: home.url, title: home.title, excerpt: home.markdown.slice(0, SITE_HOMEPAGE_CHARS) } : null,
    about: about ? { url: about.url, excerpt: about.markdown.slice(0, SITE_ABOUT_CHARS) } : null,
    pages,
    editorialShare: editorialShare(pages),
    productPages: productPages(pages),
  };
}

export function profileSite(router: ProviderRouter, page: FetchedPage): Promise<SiteProfile | null> {
  const hostname = hostnameOf(page.url);
  let pending = cache.get(hostname);
  if (!pending) {
    pending = build(router, page, hostname).catch(() => null);
    cache.set(hostname, pending);
  }
  return pending;
}
