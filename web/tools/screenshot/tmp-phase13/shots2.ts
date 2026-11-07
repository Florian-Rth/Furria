import { mkdirSync } from 'node:fs';
import type { BrowserContext, Page } from 'playwright';
import { launchDevBrowser, signIn } from '../src/dev-session.ts';

const BASE = process.env.SHOT_BASE ?? 'http://localhost:3011';
const OUT = new URL('./out/', import.meta.url).pathname;
const VIEWPORTS = [
  { name: 'phone', width: 390, height: 844, touch: true, schemes: ['light', 'dark'] },
  { name: 'small', width: 390, height: 664, touch: true, schemes: ['light'] },
] as const;
const JOBS = ['Schritte', 'Aufstellung', 'Bewegung', 'Besetzung'] as const;
const blocked: string[] = [];
const problems: string[] = [];

const guard = async (context: BrowserContext): Promise<void> => {
  await context.route('**/api/**', (route) => {
    const request = route.request();
    if (request.method() === 'GET' || /\/api\/auth\/(login|refresh)$/.test(request.url())) {
      return route.continue();
    }
    blocked.push(`${request.method()} ${request.url()}`);
    return route.abort();
  });
};

const settle = (page: Page, ms = 1500): Promise<void> => page.waitForTimeout(ms);

const shoot = async (page: Page, stem: string): Promise<void> => {
  await settle(page);
  await page.screenshot({ path: `${OUT}${stem}.png` });
  console.log('shot', stem);
};

const clickByName = async (page: Page, name: string | RegExp): Promise<boolean> => {
  const target = page.getByRole('button', { name, exact: typeof name === 'string' }).first();
  if ((await target.count()) === 0 || !(await target.isVisible())) {
    const tab = page.getByRole('tab', { name, exact: typeof name === 'string' }).first();
    if ((await tab.count()) === 0) {
      return false;
    }
    await tab.click();
    return true;
  }
  if (!(await target.isEnabled())) {
    return false;
  }
  await target.click();
  return true;
};

const run = async (): Promise<void> => {
  mkdirSync(OUT, { recursive: true });
  const browser = await launchDevBrowser();
  for (const viewport of VIEWPORTS) {
    for (const scheme of viewport.schemes) {
      const tag = `${viewport.name}-${scheme}`;
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
        deviceScaleFactor: 2,
        hasTouch: viewport.touch,
        colorScheme: scheme,
        locale: 'de-DE',
        timezoneId: 'Europe/Berlin',
      });
      await guard(context);
      const page = await context.newPage();
      page.on('pageerror', (error) => problems.push(`${tag} pageerror ${error.message}`));
      page.on('console', (message) => {
        if (message.type() === 'error') {
          problems.push(`${tag} console ${message.text().slice(0, 200)}`);
        }
      });
      await signIn(page, BASE);
      await page.goto(`${BASE}/acts/3?view=play&edit=true&pwa=false`, { waitUntil: 'networkidle' });
      await shoot(page, `edit-open-${tag}`);
      for (const job of JOBS) {
        const radio = page.getByRole('radio', { name: job }).first();
        if ((await radio.count()) === 0) {
          problems.push(`${tag} could not choose job ${job}`);
          continue;
        }
        await radio.click();
        await shoot(page, `edit-${job.toLowerCase()}-${tag}`);
      }
      await page.goto(`${BASE}/acts/3/steps/setup?pwa=false`, { waitUntil: 'networkidle' });
      await shoot(page, `setup-1-video-${tag}`);
      await page.getByRole('button', { name: /Probe/ }).last().click();
      await shoot(page, `setup-1b-video-picked-${tag}`);
      if (await clickByName(page, 'Weiter: Trennen')) {
        await shoot(page, `setup-2-borders-${tag}`);
        if (await clickByName(page, 'Weiter: Benennen')) {
          await shoot(page, `setup-3-names-${tag}`);
          if (await clickByName(page, 'Weiter: Abschluss')) {
            await shoot(page, `setup-4-finish-${tag}`);
          } else {
            problems.push(`${tag} finish not reachable`);
          }
        } else {
          problems.push(`${tag} names not reachable`);
        }
      } else {
        problems.push(`${tag} borders not reachable`);
      }
      await context.close();
    }
  }
  await browser.close();
  console.log('BLOCKED', JSON.stringify(blocked, null, 1));
  console.log('PROBLEMS', JSON.stringify(problems, null, 1));
};

await run();
