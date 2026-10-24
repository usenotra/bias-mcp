import assert from "node:assert/strict";
import { test } from "node:test";
import { biasLevel, clampScore, filterSources } from "../src/utils/bias.js";
import { mergeSearchResults } from "../src/utils/merge.js";
import { hostnameOf, normalizeUrl } from "../src/utils/url.js";

test("normalizeUrl strips www, tracking params, hash and trailing slash", () => {
  assert.equal(normalizeUrl("http://www.Example.com/a/?utm_source=x&id=2#top"), "https://example.com/a?id=2");
  assert.equal(normalizeUrl("https://example.com/"), "https://example.com");
  assert.equal(normalizeUrl("not a url"), "not a url");
});

test("hostnameOf drops www", () => {
  assert.equal(hostnameOf("https://www.lumora.example/blog"), "lumora.example");
});

test("clampScore bounds, rounds and nulls inapplicable scores", () => {
  assert.equal(clampScore(1.4, true), 1);
  assert.equal(clampScore(-0.2, true), 0);
  assert.equal(clampScore(0.456, true), 0.46);
  assert.equal(clampScore(0.9, false), null);
  assert.equal(clampScore(null, true), null);
});

test("biasLevel maps scores to levels", () => {
  assert.equal(biasLevel(null), null);
  assert.equal(biasLevel(0.1), "none");
  assert.equal(biasLevel(0.3), "low");
  assert.equal(biasLevel(0.5), "medium");
  assert.equal(biasLevel(0.8), "high");
  assert.equal(biasLevel(0.95), "very_high");
});

test("filterSources keeps only URLs from the provided material", () => {
  const sources = [
    { url: "https://www.lumora.example/blog/best-crm/" },
    { url: "https://lumora.example/about" },
    { url: "https://invented.example/press" },
  ];
  const kept = filterSources(sources, ["https://lumora.example/blog/best-crm", "https://lumora.example/about"]);
  assert.deepEqual(kept.map((s) => s.url), ["https://www.lumora.example/blog/best-crm/", "https://lumora.example/about"]);
});

test("mergeSearchResults dedupes URLs and ranks agreement first", () => {
  const merged = mergeSearchResults([
    { provider: "exa", hits: [{ url: "https://a.example", title: "A", snippet: "a" }, { url: "https://www.b.example/", title: "B", snippet: "b" }] },
    { provider: "context", hits: [{ url: "https://b.example", title: "B", snippet: "longer snippet" }] },
  ]);
  assert.equal(merged.length, 2);
  assert.equal(normalizeUrl(merged[0].url), "https://b.example");
  assert.deepEqual(merged[0].providers, ["exa", "context"]);
  assert.equal(merged[0].snippet, "longer snippet");
});

test("applySatellitePenalty adds 0.2 only when detected and caps at 1", async () => {
  const { applySatellitePenalty } = await import("../src/utils/bias.js");
  assert.equal(applySatellitePenalty(0.3, true), 0.5);
  assert.equal(applySatellitePenalty(0.9, true), 1);
  assert.equal(applySatellitePenalty(0.3, false), 0.3);
  assert.equal(applySatellitePenalty(null, true), null);
});

test("site helpers measure editorial share and product pages", async () => {
  const { editorialShare, productPages, isAboutPage } = await import("../src/utils/site.js");
  const pages = [
    { url: "https://a.example/alternatives/x", title: "", snippet: "" },
    { url: "https://a.example/compare", title: "", snippet: "" },
    { url: "https://a.example/pricing", title: "", snippet: "" },
    { url: "https://a.example/about", title: "", snippet: "" },
  ];
  assert.equal(editorialShare(pages), 0.5);
  assert.deepEqual(productPages(pages), ["https://a.example/pricing"]);
  assert.equal(isAboutPage("https://a.example/about-us"), true);
});
