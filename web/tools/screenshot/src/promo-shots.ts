import path from 'node:path';
import type { Browser, BrowserContextOptions, Page } from 'playwright';
import { DEV_LOCALE, launchDevBrowser, signIn } from './dev-session.ts';

const APP_BASE = process.env.PROMO_APP ?? 'http://127.0.0.1:3041';
const SITE_BASE = process.env.PROMO_SITE ?? 'http://127.0.0.1:3040';
const ACT_ID = process.env.PROMO_ACT ?? '';
const EVENT_ID = process.env.PROMO_EVENT ?? '';
const ONLY = (process.env.PROMO_ONLY ?? '').split(',').filter((name) => name !== '');
const OUT = path.resolve(import.meta.dirname, '../../../apps/club-app/src/features/promo/screens');
const SETTLE_MS = 2500;
const JPEG_QUALITY = 95;
const PREVIEW_GRANT_KEY = 'furria.preview.granted';
const TESTER_LABEL = 'Änderungen';
const CLOSE_LABEL = 'Schließen';

const PHONE: BrowserContextOptions = {
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
};
const DESKTOP: BrowserContextOptions = {
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
};

interface PromoShot {
  name: string;
  route: string;
}

const APP_SHOTS: readonly PromoShot[] = [
  { name: 'start', route: '/' },
  { name: 'calendar', route: '/calendar' },
  { name: 'act', route: `/acts/${ACT_ID}` },
  { name: 'training', route: `/acts/${ACT_ID}/practice` },
  { name: 'running-order', route: `/events/${EVENT_ID}/running-order` },
  { name: 'table-plan', route: `/events/${EVENT_ID}/table-plan` },
  { name: 'news', route: '/club/news' },
  { name: 'beer-list', route: '/beer-list' },
];
const SITE_SHOTS: readonly (PromoShot & { device: BrowserContextOptions })[] = [
  { name: 'website', route: '/', device: DESKTOP },
  { name: 'website-events', route: '/events', device: PHONE },
];

const wanted = (shot: PromoShot): boolean => ONLY.length === 0 || ONLY.includes(shot.name);

const contextOf = (browser: Browser, device: BrowserContextOptions) =>
  browser.newContext({
    ...device,
    locale: DEV_LOCALE,
    timezoneId: 'Europe/Berlin',
    colorScheme: 'light',
    reducedMotion: 'reduce',
  });

const save = async (page: Page, name: string): Promise<void> => {
  await page.screenshot({ path: `${OUT}/${name}.jpg`, type: 'jpeg', quality: JPEG_QUALITY });
  console.log(`shot ${name} ← ${page.url()}`);
};

const hideTesterChrome = (label: string): void => {
  for (const element of document.querySelectorAll<HTMLElement>('body *')) {
    const box = element.getBoundingClientRect();
    const floating = getComputedStyle(element).position === 'fixed';
    const cornered = box.top > innerHeight / 2 && box.left > innerWidth / 2;

    if ((floating && cornered) || element.textContent === label) {
      element.style.visibility = 'hidden';
    }
  }
};

const grantPreview = (key: string): void => {
  sessionStorage.setItem(key, 'granted');
};

const closeDialogs = async (page: Page): Promise<void> => {
  const close = page.getByRole('button', { name: CLOSE_LABEL });

  if ((await close.count()) > 0) {
    await close.first().click();
  }
};

const shootApp = async (browser: Browser): Promise<void> => {
  const shots = APP_SHOTS.filter(wanted);

  if (shots.length === 0) {
    return;
  }
  const context = await contextOf(browser, PHONE);
  const page = await context.newPage();

  await signIn(page, APP_BASE);
  for (const shot of shots) {
    await page.goto(`${APP_BASE}${shot.route}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(SETTLE_MS);
    await save(page, shot.name);
  }
  await context.close();
};

const shootSite = async (browser: Browser): Promise<void> => {
  for (const shot of SITE_SHOTS.filter(wanted)) {
    const context = await contextOf(browser, shot.device);

    await context.addInitScript(grantPreview, PREVIEW_GRANT_KEY);
    const page = await context.newPage();

    await page.goto(`${SITE_BASE}${shot.route}`, { waitUntil: 'networkidle' });
    await closeDialogs(page);
    await page.waitForTimeout(SETTLE_MS);
    await page.evaluate(hideTesterChrome, TESTER_LABEL);
    await save(page, shot.name);
    await context.close();
  }
};

const browser = await launchDevBrowser();

await shootApp(browser);
await shootSite(browser);
await browser.close();
