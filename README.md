# UsefulHub — Community-Curated Website Discovery Directory

**Discover websites worth bookmarking.**

UsefulHub is a fast, modern, zero-database community directory of genuinely useful websites, developer tools, creative apps, educational platforms, and online utilities. Every community submission is reviewed by a human administrator before being published.

---

## Key Features

- **Zero Database & Zero API Keys**: Approved website data lives in `src/data/sites.json`, accessed through an isolated `src/services/websiteService.ts` layer so you can migrate to a database later without rewriting UI components.
- **Fast Client-Side Search**: Case-insensitive, multi-term search across website names, descriptions, categories, tags, and domains with live suggestions and `Cmd/Ctrl + K` keyboard shortcut.
- **16 Curated Categories**: Dedicated, SEO-optimized category pages (`/categories/[slug]`) with live counts and in-category search.
- **Local Favorites**: Bookmark websites directly to `LocalStorage` with zero registration and clear local-only privacy notices.
- **Random Website Discovery**: Animated discovery modal with optional category filtering.
- **GitHub Issue Submissions**: Validated submission form with real-time URL safety checks, duplicate detection against approved listings, shortened URL warnings, pre-filled GitHub Issue Form URLs (`.github/ISSUE_TEMPLATE/website-suggestion.yml`), optional Google Forms support, and email/copy fallbacks for visitors without a GitHub account.
- **Local Admin Utility (`/admin`)**: Add, edit, delete, toggle featured status, preview cards live, detect duplicates, validate/import JSON, and export/download an updated `sites.json`.
- **Light & Dark Mode**: Accessible dual-theme support persisted in `LocalStorage`.
- **SEO Ready**: Per-page metadata, Open Graph & Twitter cards, JSON-LD `WebSite` structured data, dynamic `robots.txt`, and `sitemap.xml`.

---

## 1. Prerequisites & Local Setup

1. **Install Node.js** (v20 LTS or newer recommended) from [nodejs.org](https://nodejs.org).
2. **Clone or download the repository**:
   ```bash
   git clone https://github.com/adityasing9/usefulhub.git
   cd usefulhub
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Run the development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 2. Configure Branding & GitHub Submissions

Open `src/config/siteConfig.ts` and customize:

```ts
export const siteConfig = {
  siteName: 'UsefulHub',
  tagline: 'Discover websites worth bookmarking.',
  siteUrl: 'https://your-domain.com',
  githubOwner: 'adityasing9',
  githubRepo: 'usefulhub',
  googleFormsUrl: '', // Optional: add a Google Forms URL for non-GitHub users
  contactEmail: 'hello@your-domain.com',
};
```

### Enable the GitHub Issue Form
1. Push this repository to GitHub (the template is already included at `.github/ISSUE_TEMPLATE/website-suggestion.yml`).
2. In your GitHub repository settings, ensure **Issues** are enabled.
3. Create the labels `website-suggestion`, `pending-review`, `approved`, and `rejected` under **Issues → Labels**.
4. Test the workflow by visiting `/suggest`, filling out a sample website, and clicking **Open Pre-filled GitHub Issue**.

---

## 3. Admin Approval Workflow (No Database)

1. A visitor submits a suggestion on `/suggest` → a GitHub Issue is opened with labels `website-suggestion` and `pending-review`.
2. You review the issue manually:
   - Is the website legitimate, safe, and genuinely useful?
   - Does the HTTPS URL work cleanly without affiliate redirects?
   - Is it already listed?
   - Are the description, category, and pricing label accurate?
3. **If Approved**:
   - Open `/admin` locally (or edit `src/data/sites.json` directly).
   - Add the website with `approved: true`, today's date, tags, and optional `featured: true`.
   - Click **Download sites.json** and replace `src/data/sites.json` in your repository.
   - Commit and push your changes:
     ```bash
     git add src/data/sites.json
     git commit -m "Add approved website: Example"
     git push
     ```
   - Close the GitHub Issue and add the `approved` label.
4. **If Rejected**:
   - Do not add it to `src/data/sites.json`.
   - Close the GitHub Issue, add the `rejected` label, and optionally explain why.

---

## 4. Build & Verify

Run unit tests and a production build before deploying:

```bash
npx tsx --test src/utils/core.test.ts
npm run lint
npm run build
npm run start
```

---

## 5. Deployment Options

> **Note:** Free hosting tiers are subject to each provider's current terms of service and usage limits.

### Option A: Vercel (Recommended for Next.js)
1. Push your repository to GitHub.
2. Go to [vercel.com](https://vercel.com), click **Add New Project**, and import your GitHub repository.
3. Set `APP_URL` in Environment Variables to your production URL (e.g., `https://usefulhub.vercel.app`).
4. Click **Deploy**. Every push to `main` automatically rebuilds and publishes updates.

### Option B: Cloudflare Pages
1. Push your repository to GitHub.
2. In the Cloudflare Dashboard, open **Workers & Pages → Create application → Pages → Connect to Git**.
3. Select your repository and configure the Next.js build preset (`npm run build`).
4. Add `APP_URL` as an environment variable and deploy.

### Option C: GitHub Pages (Static Export)
1. If you prefer purely static hosting on GitHub Pages, set `output: 'export'` and `images: { unoptimized: true }` in `next.config.ts`.
2. Run `npm run build` (outputs static files to `out/`).
3. Publish the `out/` directory via GitHub Actions (`actions/deploy-pages`).

### Connecting a Custom Domain
1. Purchase a domain from any registrar (Cloudflare, Namecheap, Porkbun, etc.).
2. In Vercel or Cloudflare Pages, open **Project Settings → Domains** and add your custom domain.
3. Add the provided `A` / `CNAME` DNS records at your registrar.
4. Update `siteUrl` in `src/config/siteConfig.ts` (or `APP_URL` env var) so canonical URLs, Open Graph tags, `robots.txt`, and `sitemap.xml` match your custom domain.

---

## 6. Architecture & Future Database Migration

All UI pages and components read directory data exclusively through `src/services/websiteService.ts`:

- `getAllWebsites()`
- `getWebsiteById(id)`
- `getFeaturedWebsites(limit)`
- `getWebsitesByCategory(category)`
- `searchWebsites(query, options)`
- `getRecentlyAddedWebsites(limit)`
- `getRandomWebsite(options)`

When you are ready to scale beyond a static JSON file (for example, to PostgreSQL, SQLite, or a headless CMS), update the functions inside `src/services/websiteService.ts` while keeping the rest of the application intact.
