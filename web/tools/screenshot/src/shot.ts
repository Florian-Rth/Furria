import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import type { Browser, Page } from 'playwright';
import { chromium } from 'playwright';
import type { ShotRequest, ShotVariant } from './shot-plan.ts';
import { buildShotVariants, parseShotArgs } from './shot-plan.ts';

const DEV_EMAIL = 'admin@furria.local';
const DEV_PASSWORD = 'Furria-Dev-Admin-1!';
const DEFAULT_CHANNEL = 'chrome';

const launchBrowser = (): Promise<Browser> =>
  chromium.launch({ channel: process.env.SHOT_BROWSER_CHANNEL ?? DEFAULT_CHANNEL });

const signIn = async (page: Page, baseUrl: string): Promise<void> => {
  await page.goto(`${baseUrl}/login`, { waitUntil: 'networkidle' });
  await page
    .getByLabel('E-Mail-Adresse', { exact: true })
    .fill(process.env.SHOT_EMAIL ?? DEV_EMAIL);
  await page
    .getByLabel('Passwort', { exact: true })
    .fill(process.env.SHOT_PASSWORD ?? DEV_PASSWORD);
  await page.getByRole('button', { name: 'Anmelden' }).click();
  await page.waitForURL((url) => !url.pathname.startsWith('/login'));
};

const capture = async (
  browser: Browser,
  request: ShotRequest,
  variant: ShotVariant,
): Promise<string> => {
  const context = await browser.newContext({
    viewport: { width: variant.width, height: variant.height },
    colorScheme: variant.scheme,
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();
  if (request.login) {
    await signIn(page, request.baseUrl);
  }
  await page.goto(`${request.baseUrl}${request.route}`, { waitUntil: 'networkidle' });
  const filePath = path.join(request.outDir, variant.fileName);
  await page.screenshot({ path: filePath, fullPage: true, animations: 'disabled' });
  await context.close();
  return filePath;
};

const run = async (): Promise<void> => {
  const request = parseShotArgs(process.argv.slice(2));
  await mkdir(request.outDir, { recursive: true });
  const browser = await launchBrowser();
  try {
    for (const variant of buildShotVariants(request.name)) {
      const filePath = await capture(browser, request, variant);
      console.log(path.resolve(filePath));
    }
  } finally {
    await browser.close();
  }
};

run().catch((error: Error) => {
  console.error(error.message);
  process.exitCode = 1;
});
