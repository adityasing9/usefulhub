import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySessionToken } from '../../../../src/utils/adminAuth';
import { validateSitesJsonPayload } from '../../../../src/utils/validation';
import { siteConfig } from '../../../../src/config/siteConfig';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  // 1. Verify admin session cookie
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('usefulhub_admin_session')?.value;
  const isAuthorized = await verifySessionToken(sessionToken);

  if (!isAuthorized) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized: Admin authentication required.' },
      { status: 401 }
    );
  }

  // 2. Parse request payload
  let body: {
    sites?: unknown;
    commitMessage?: string;
    githubToken?: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid JSON request payload.' },
      { status: 400 }
    );
  }

  const { sites, commitMessage, githubToken } = body;
  if (!Array.isArray(sites)) {
    return NextResponse.json(
      { success: false, error: 'Payload must contain a "sites" array.' },
      { status: 400 }
    );
  }

  // 3. Validate schema
  const validation = validateSitesJsonPayload(sites);
  if (!validation.valid) {
    return NextResponse.json(
      {
        success: false,
        error: 'Website dataset failed validation checks.',
        details: validation.errors,
      },
      { status: 400 }
    );
  }

  // 4. Resolve GitHub credentials
  const token =
    githubToken?.trim() ||
    process.env.GITHUB_TOKEN ||
    process.env.GITHUB_PAT ||
    process.env.GH_TOKEN;

  const owner = siteConfig.githubOwner;
  const repo = siteConfig.githubRepo;
  const filePath = 'src/data/sites.json';

  if (!token) {
    return NextResponse.json({
      success: true,
      published: false,
      requiresToken: true,
      sitesCount: validation.sites.length,
      message:
        'Sites validated successfully! To publish live to production from any device, enter your GitHub Personal Access Token or add GITHUB_TOKEN to your Vercel project environment variables.',
    });
  }

  // 5. Commit to GitHub repository via REST API
  try {
    const fileApiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;
    const getRes = await fetch(fileApiUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'User-Agent': 'UsefulHub-Admin-Portal',
      },
      cache: 'no-store',
    });

    if (!getRes.ok) {
      const errData = await getRes.json().catch(() => ({}));
      return NextResponse.json(
        {
          success: false,
          error: `Could not reach GitHub repository: ${errData.message || getRes.statusText}`,
        },
        { status: 502 }
      );
    }

    const fileData = await getRes.json();
    const currentSha = fileData.sha;

    const formattedJson = JSON.stringify(validation.sites, null, 2) + '\n';
    const base64Content = Buffer.from(formattedJson, 'utf8').toString('base64');

    const putRes = await fetch(fileApiUrl, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
        'User-Agent': 'UsefulHub-Admin-Portal',
      },
      body: JSON.stringify({
        message:
          commitMessage?.trim() ||
          `Update directory via UsefulHub Admin (${validation.sites.length} sites)`,
        content: base64Content,
        sha: currentSha,
        branch: 'main',
      }),
    });

    if (!putRes.ok) {
      const errData = await putRes.json().catch(() => ({}));
      return NextResponse.json(
        {
          success: false,
          error: `Failed to commit changes to GitHub: ${errData.message || putRes.statusText}`,
        },
        { status: 502 }
      );
    }

    const commitResult = await putRes.json();

    return NextResponse.json({
      success: true,
      published: true,
      sitesCount: validation.sites.length,
      commitUrl: commitResult.commit?.html_url || `https://github.com/${owner}/${repo}/commits/main`,
      commitSha: commitResult.commit?.sha?.slice(0, 7) || 'latest',
      message:
        'Changes committed directly to GitHub! Vercel is now automatically rebuilding and deploying your changes to production.',
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown network error.';
    return NextResponse.json(
      { success: false, error: `GitHub API error: ${message}` },
      { status: 500 }
    );
  }
}
