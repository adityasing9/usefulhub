import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getAllWebsites,
  getFeaturedWebsites,
  getRecentlyAddedWebsites,
  getWebsitesByCategory,
  getRandomWebsite,
  getCategoryCounts,
} from '../services/websiteService';
import { filterAndSearchWebsites, buildSearchSuggestions } from './search';
import {
  validateWebsiteUrl,
  validateSubmission,
  findDuplicateWebsite,
  normalizeUrlForComparison,
} from './validation';
import { buildGitHubSubmissionUrl, buildPlainTextSubmissionSummary } from './githubSubmission';
import { parseAndValidateSitesJson, serializeSitesJson, generateWebsiteId } from './jsonImportExport';
import { siteConfig } from '../config/siteConfig';

test('dataset contains at least 30 verified approved websites across all categories', () => {
  const all = getAllWebsites();
  assert.ok(all.length >= 30, `Expected at least 30 sites, got ${all.length}`);
  assert.ok(all.every((s) => s.approved === true));
  assert.ok(all.every((s) => s.url.startsWith('https://')));

  const counts = getCategoryCounts();
  for (const [category, count] of Object.entries(counts)) {
    assert.ok(count >= 1, `Expected at least 1 website in category ${category}`);
  }
});

test('featured and recently added queries return sorted approved subsets', () => {
  const featured = getFeaturedWebsites();
  assert.ok(featured.length >= 5);
  assert.ok(featured.every((s) => s.featured && s.approved));

  const recent = getRecentlyAddedWebsites(6);
  assert.equal(recent.length, 6);
  for (let i = 1; i < recent.length; i += 1) {
    assert.ok(recent[i - 1].dateAdded >= recent[i].dateAdded);
  }
});

test('client-side search matches name, description, category, tags, and URL case-insensitively', () => {
  const all = getAllWebsites();

  const byName = filterAndSearchWebsites(all, { query: 'FIGMA' });
  assert.equal(byName[0]?.id, 'figma');

  const byTag = filterAndSearchWebsites(all, { query: 'wayback' });
  assert.ok(byTag.some((s) => s.id === 'internet-archive'));

  const byCategory = filterAndSearchWebsites(all, { category: 'Security & Privacy' });
  assert.ok(byCategory.length >= 2);
  assert.ok(byCategory.every((s) => s.category === 'Security & Privacy'));

  const alphabetical = filterAndSearchWebsites(all, { sort: 'alphabetical' });
  assert.ok(alphabetical[0].name.localeCompare(alphabetical[1].name) <= 0);

  const suggestions = buildSearchSuggestions(all, 'excal');
  assert.ok(suggestions.some((s) => s.label === 'Excalidraw'));
});

test('URL validation rejects unsafe protocols, localhost, and flags shortened/HTTP URLs', () => {
  assert.equal(validateWebsiteUrl('javascript:alert(1)').valid, false);
  assert.equal(validateWebsiteUrl('data:text/html,test').valid, false);
  assert.equal(validateWebsiteUrl('ftp://example.com').valid, false);
  assert.equal(validateWebsiteUrl('https://localhost:3000').valid, false);
  assert.equal(validateWebsiteUrl('https://trusted.com@evil.com').valid, false);

  const shortUrl = validateWebsiteUrl('https://bit.ly/demo-link');
  assert.equal(shortUrl.valid, true);
  assert.ok(shortUrl.warnings.some((w) => w.toLowerCase().includes('shortened')));

  const httpUrl = validateWebsiteUrl('http://example.org');
  assert.equal(httpUrl.valid, true);
  assert.ok(httpUrl.warnings.some((w) => w.includes('HTTPS')));

  const clean = validateWebsiteUrl('https://example.org/');
  assert.equal(clean.valid, true);
  assert.equal(clean.normalizedUrl, 'https://example.org');
});

test('duplicate URL detection ignores www, protocol, and trailing slash', () => {
  const all = getAllWebsites();
  assert.equal(normalizeUrlForComparison('https://www.GitHub.com/'), 'github.com');

  const dup = findDuplicateWebsite('https://www.github.com/', all);
  assert.equal(dup?.id, 'github');

  const nonDup = findDuplicateWebsite('https://unique-new-resource.example.org', all);
  assert.equal(nonDup, null);
});

test('submission validation enforces required fields and flags duplicates', () => {
  const all = getAllWebsites();
  const emptyResult = validateSubmission(
    { name: '', url: '', category: '', description: '', whyUseful: '' },
    all
  );
  assert.equal(emptyResult.valid, false);
  assert.ok(emptyResult.errors.name);
  assert.ok(emptyResult.errors.url);
  assert.ok(emptyResult.errors.category);
  assert.ok(emptyResult.errors.description);
  assert.ok(emptyResult.errors.whyUseful);

  const validDup = validateSubmission(
    {
      name: 'GitHub',
      url: 'https://www.github.com/',
      category: 'Developer Tools',
      description: 'Code hosting and version control platform for software teams.',
      whyUseful: 'Essential for hosting repositories and open-source collaboration.',
    },
    all
  );
  assert.equal(validDup.valid, true);
  assert.equal(validDup.duplicateMatch?.id, 'github');
});

test('GitHub submission URL builder prepopulates fields without secrets', () => {
  const url = buildGitHubSubmissionUrl(
    {
      name: 'Linear',
      url: 'https://linear.app',
      category: 'Productivity',
      description: 'Fast issue tracking and project planning tool for software teams.',
      whyUseful: 'Keyboard-first workflow that makes engineering planning crisp.',
      tags: 'Issues, Planning',
      submitterName: 'Alex',
    },
    'https://linear.app',
    { ...siteConfig, githubOwner: 'acme', githubRepo: 'usefulhub' }
  );

  assert.ok(url.startsWith('https://github.com/acme/usefulhub/issues/new?'));
  assert.ok(url.includes('template=website-suggestion.yml'));
  assert.ok(url.includes('labels=website-suggestion%2Cpending-review'));
  assert.ok(url.includes('website-name=Linear'));
  assert.ok(url.includes('website-url=https%3A%2F%2Flinear.app'));

  const summary = buildPlainTextSubmissionSummary(
    {
      name: 'Linear',
      url: 'https://linear.app',
      category: 'Productivity',
      description: 'Fast issue tracking.',
      whyUseful: 'Very practical.',
    },
    'https://linear.app'
  );
  assert.ok(summary.includes('Website Name: Linear'));
});

test('JSON import/export validates schema and catches invalid data', () => {
  const all = getAllWebsites();
  const serialized = serializeSitesJson(all);
  const reimported = parseAndValidateSitesJson(serialized);
  assert.equal(reimported.valid, true);
  assert.equal(reimported.sites.length, all.length);

  const badSyntax = parseAndValidateSitesJson('{ not json');
  assert.equal(badSyntax.valid, false);
  assert.ok(badSyntax.errors[0].includes('JSON syntax error'));

  const badPayload = parseAndValidateSitesJson(
    JSON.stringify([{ id: 'bad', name: 'Bad', url: 'javascript:alert(1)', description: 'x', category: 'Other', approved: true }])
  );
  assert.equal(badPayload.valid, false);

  const id = generateWebsiteId('Figma', new Set(['figma']));
  assert.equal(id, 'figma-2');
});

test('random website returns an approved website and respects category filter', () => {
  const anySite = getRandomWebsite();
  assert.ok(anySite !== null);
  assert.equal(anySite.approved, true);

  const designSite = getRandomWebsite({ category: 'Design & Creativity' });
  assert.ok(designSite !== null);
  assert.equal(designSite.category, 'Design & Creativity');

  const bySlug = getWebsitesByCategory('developer-tools');
  assert.ok(bySlug.length >= 4);
});
