import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { Browser, BrowserContext, BrowserContextOptions, Page } from 'playwright';
import { chromium } from 'playwright';
import type { ShotRequest, ShotVariant, TimedFrame } from './shot-plan.ts';
import {
  buildShotVariants,
  FILMSTRIP_OFFSETS_MS,
  filmstripFrameFileName,
  filmstripSheetFileName,
  parseShotArgs,
  pickFilmstripFrames,
} from './shot-plan.ts';

const DEV_EMAIL = 'admin@furria.local';
const DEV_PASSWORD = 'Furria-Dev-Admin-1!';
const DEFAULT_CHANNEL = 'chrome';
const DEFAULT_TIMEZONE = 'Europe/Berlin';
const LOCALE = 'de-DE';
const TITLE_SELECTOR = '[data-kk-screen-header-title]';
const START_MEMORY_PREFIX = 'furria.start.';
const PERCENT = 100;
const CLICK_SETTLE_MS = 700;
const FILMSTRIP_TAIL_MS = 300;
const SHEET_GAP_PX = 12;
const CAPTURE_ATTEMPTS = 5;
const STEP_TIMEOUT_MS = 15_000;
const NETWORK_CHANGED = 'net::ERR_NETWORK_CHANGED';
const RENDERED_ROOT_SELECTOR = '#root > *';

interface ScreencastFrame extends TimedFrame {
  readonly png: Buffer;
}

interface ShotSession {
  readonly context: BrowserContext;
  readonly page: Page;
}

interface Arrival {
  readonly frames: readonly ScreencastFrame[];
  readonly shownAt: number;
}

type Capture = (
  browser: Browser,
  request: ShotRequest,
  variant: ShotVariant,
  problems: string[],
) => Promise<string[]>;

const launchBrowser = (): Promise<Browser> =>
  chromium.launch({ channel: process.env.SHOT_BROWSER_CHANNEL ?? DEFAULT_CHANNEL });

const contextOptionsOf = (request: ShotRequest, variant: ShotVariant): BrowserContextOptions => ({
  viewport: { width: variant.width, height: variant.height },
  colorScheme: variant.scheme,
  deviceScaleFactor: 2,
  reducedMotion: request.reducedMotion ? 'reduce' : 'no-preference',
  timezoneId: process.env.SHOT_TIMEZONE ?? DEFAULT_TIMEZONE,
  locale: LOCALE,
});

const forgetStartMemory = (prefix: string): void => {
  const keys = Array.from({ length: window.localStorage.length }, (_, index) =>
    window.localStorage.key(index),
  );
  for (const key of keys) {
    if (key?.startsWith(prefix)) {
      window.localStorage.removeItem(key);
    }
  }
};

const scaleText = (percent: number): void => {
  const style = document.createElement('style');
  style.textContent = `html{font-size:${percent}%}`;
  const attach = (): void => {
    document.documentElement.append(style);
  };
  if (document.documentElement === null) {
    document.addEventListener('DOMContentLoaded', attach, { once: true });
  } else {
    attach();
  }
};

const watchTitle = (selector: string): void => {
  const mark = (): boolean => {
    if (document.querySelector(selector) === null) {
      return false;
    }
    document.documentElement.dataset.shotTitleAt = String(Date.now());
    return true;
  };
  if (mark()) {
    return;
  }
  const observer = new MutationObserver(() => {
    if (mark()) {
      observer.disconnect();
    }
  });
  observer.observe(document, { childList: true, subtree: true });
};

const isApiPath = (url: string): boolean => new URL(url).pathname.startsWith('/api/');

const watchNetworkChange = (page: Page): (() => boolean) => {
  let changed = false;
  page.on('requestfailed', (request) => {
    if (request.failure()?.errorText === NETWORK_CHANGED) {
      changed = true;
    }
  });
  return () => changed;
};

const watchProblems = (page: Page, label: string, problems: string[]): void => {
  page.on('console', (message) => {
    if (message.type() === 'error') {
      problems.push(`${label} console: ${message.text()}`);
    }
  });
  page.on('pageerror', (error) => {
    problems.push(`${label} page error: ${error.message}`);
  });
  page.on('response', (response) => {
    if (response.status() >= 400 && isApiPath(response.url())) {
      problems.push(
        `${label} ${response.status()} ${response.request().method()} ${response.url()}`,
      );
    }
  });
};

const signIn = async (page: Page, baseUrl: string): Promise<void> => {
  await page.goto(`${baseUrl}/login`, { waitUntil: 'networkidle' });
  await page
    .getByLabel('E-Mail-Adresse', { exact: true })
    .fill(process.env.SHOT_EMAIL ?? DEV_EMAIL);
  await page
    .getByLabel('Passwort', { exact: true })
    .fill(process.env.SHOT_PASSWORD ?? DEV_PASSWORD);
  await page.getByRole('button', { name: 'Anmelden', exact: true }).click();
  await page.waitForURL((url) => !url.pathname.startsWith('/login'));
};

const withSession = async <TResult>(
  browser: Browser,
  request: ShotRequest,
  variant: ShotVariant,
  problems: string[],
  use: (session: ShotSession) => Promise<TResult>,
): Promise<TResult> => {
  const context = await browser.newContext(contextOptionsOf(request, variant));
  try {
    context.setDefaultTimeout(STEP_TIMEOUT_MS);
    await context.addInitScript(forgetStartMemory, START_MEMORY_PREFIX);
    if (request.textScale !== null) {
      await context.addInitScript(scaleText, request.textScale * PERCENT);
    }
    const page = await context.newPage();
    const attemptProblems: string[] = [];
    watchProblems(page, `${request.name}-${variant.viewport}-${variant.scheme}`, attemptProblems);
    const hasNetworkChanged = watchNetworkChange(page);
    if (request.login) {
      await signIn(page, request.baseUrl);
    }
    const result = await use({ context, page });
    if (hasNetworkChanged()) {
      throw new Error('the host network changed while the page loaded');
    }
    problems.push(...attemptProblems);
    return result;
  } finally {
    await context.close();
  }
};

const settleFonts = async (page: Page): Promise<void> => {
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
};

const nextFrame = async (page: Page): Promise<void> => {
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          resolve();
        });
      }),
  );
};

const growToContent = async (page: Page, variant: ShotVariant): Promise<void> => {
  const contentHeight = await page.evaluate(() => document.documentElement.scrollHeight);
  if (contentHeight > variant.height) {
    await page.setViewportSize({ width: variant.width, height: contentHeight });
    await nextFrame(page);
    await nextFrame(page);
  }
};

const captureStill: Capture = (browser, request, variant, problems) =>
  withSession(browser, request, variant, problems, async ({ page }) => {
    await page.goto(`${request.baseUrl}${request.route}`, { waitUntil: 'networkidle' });
    await page.waitForSelector(RENDERED_ROOT_SELECTOR, { state: 'attached' });
    await settleFonts(page);
    for (const selector of request.clicks) {
      await page.locator(selector).first().click();
      await page.waitForTimeout(CLICK_SETTLE_MS);
    }
    await growToContent(page, variant);
    const filePath = path.join(request.outDir, variant.fileName);
    await page.screenshot({ path: filePath, fullPage: true, animations: 'disabled' });
    return [filePath];
  });

const sheetHtmlOf = (frames: readonly (ScreencastFrame | null)[], width: number): string => {
  const figures = frames
    .map((frame, index) => {
      const caption = `${FILMSTRIP_OFFSETS_MS[index] ?? 0} ms`;
      const image =
        frame === null
          ? '<div class="none">kein Frame</div>'
          : `<img alt="${caption}" src="data:image/png;base64,${frame.png.toString('base64')}">`;
      return `<figure>${image}<figcaption>${caption}</figcaption></figure>`;
    })
    .join('');
  return [
    '<!doctype html><html><head><style>',
    `body{margin:0;padding:${SHEET_GAP_PX}px;background:#1d1b19;color:#f4efe8;`,
    `font:600 15px/1.2 system-ui;display:grid;gap:${SHEET_GAP_PX}px;`,
    `grid-template-columns:repeat(3,${width}px)}`,
    `figure{margin:0}img{display:block;width:${width}px}figcaption{padding-top:6px}`,
    '</style></head><body>',
    figures,
    '</body></html>',
  ].join('');
};

const writeFilmstripSheet = async (
  browser: Browser,
  frames: readonly (ScreencastFrame | null)[],
  variant: ShotVariant,
  filePath: string,
): Promise<void> => {
  const columns = 3;
  const page = await browser.newPage({
    viewport: { width: columns * (variant.width + SHEET_GAP_PX) + SHEET_GAP_PX, height: 600 },
  });
  await page.setContent(sheetHtmlOf(frames, variant.width), { waitUntil: 'load' });
  await page.screenshot({ path: filePath, fullPage: true });
  await page.close();
};

const recordScreencast = async (
  context: BrowserContext,
  page: Page,
): Promise<{ frames: ScreencastFrame[]; stop: () => Promise<void> }> => {
  const frames: ScreencastFrame[] = [];
  const cdp = await context.newCDPSession(page);
  cdp.on('Page.screencastFrame', (event) => {
    frames.push({
      at: (event.metadata.timestamp ?? Date.now() / 1000) * 1000,
      png: Buffer.from(event.data, 'base64'),
    });
    void cdp.send('Page.screencastFrameAck', { sessionId: event.sessionId });
  });
  await cdp.send('Page.startScreencast', { format: 'png', everyNthFrame: 1 });
  const stop = async (): Promise<void> => {
    await cdp.send('Page.stopScreencast');
  };
  return { frames, stop };
};

const recordArrival = (
  browser: Browser,
  request: ShotRequest,
  variant: ShotVariant,
  problems: string[],
): Promise<Arrival> =>
  withSession(browser, request, variant, problems, async ({ context, page }) => {
    await page.addInitScript(watchTitle, TITLE_SELECTOR);
    const screencast = await recordScreencast(context, page);
    await page.goto(`${request.baseUrl}${request.route}`, { waitUntil: 'commit' });
    await page.waitForSelector(TITLE_SELECTOR, { state: 'attached' });
    const shownAt = await page.evaluate(() => Number(document.documentElement.dataset.shotTitleAt));
    const lastOffset = Math.max(...FILMSTRIP_OFFSETS_MS);
    await page.waitForTimeout(Math.max(0, shownAt + lastOffset + FILMSTRIP_TAIL_MS - Date.now()));
    await screencast.stop();
    return { frames: screencast.frames, shownAt };
  });

const captureFilmstrip: Capture = async (browser, request, variant, problems) => {
  const { frames, shownAt } = await recordArrival(browser, request, variant, problems);
  const stem = `${request.name}-${variant.viewport}-${variant.scheme}`;
  const picked = pickFilmstripFrames(frames, shownAt, FILMSTRIP_OFFSETS_MS);
  const framePaths: string[] = [];
  for (const [index, frame] of picked.entries()) {
    const offset = FILMSTRIP_OFFSETS_MS[index] ?? 0;
    if (frame !== null) {
      const framePath = path.join(request.outDir, filmstripFrameFileName(stem, offset));
      await writeFile(framePath, frame.png);
      framePaths.push(framePath);
    }
  }
  const sheetPath = path.join(request.outDir, filmstripSheetFileName(stem));
  await writeFilmstripSheet(browser, picked, variant, sheetPath);
  return [sheetPath, ...framePaths];
};

const captureWithRetries = async (
  capture: Capture,
  browser: Browser,
  request: ShotRequest,
  variant: ShotVariant,
  problems: string[],
  attempt = 1,
): Promise<string[]> => {
  try {
    return await capture(browser, request, variant, problems);
  } catch (error) {
    if (attempt >= CAPTURE_ATTEMPTS) {
      throw error;
    }
    console.error(`retrying ${variant.fileName} after: ${String(error).split('\n')[0]}`);
    return captureWithRetries(capture, browser, request, variant, problems, attempt + 1);
  }
};

const run = async (): Promise<void> => {
  const request = parseShotArgs(process.argv.slice(2));
  await mkdir(request.outDir, { recursive: true });
  const browser = await launchBrowser();
  const problems: string[] = [];
  const capture = request.filmstrip ? captureFilmstrip : captureStill;
  try {
    for (const variant of buildShotVariants(request.name, request.viewports, request.schemes)) {
      const filePaths = await captureWithRetries(capture, browser, request, variant, problems);
      for (const filePath of filePaths) {
        console.log(path.resolve(filePath));
      }
    }
  } finally {
    await browser.close();
    for (const problem of problems) {
      console.error(`! ${problem}`);
    }
  }
};

run().catch((error: Error) => {
  console.error(error.message);
  process.exitCode = 1;
});
