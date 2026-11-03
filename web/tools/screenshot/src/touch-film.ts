import { mkdir, readFile, rename } from 'node:fs/promises';
import path from 'node:path';
import type { CDPSession, Page } from 'playwright';
import { DEV_LOCALE, launchDevBrowser, signIn } from './dev-session.ts';
import type { FilmRequest } from './film-plan.ts';
import { FILM_VIEWPORTS, parseFilmArgs } from './film-plan.ts';
import type { TouchFrame, TouchScript } from './touch-script.ts';
import { durationOf, TouchScriptSchema, touchFramesOf } from './touch-script.ts';

const OUT_DIR = 'out';
const SETTLE_MS = 800;
const STEP_TIMEOUT_MS = 15_000;

const sendFrame = (cdp: CDPSession, frame: TouchFrame): Promise<object> =>
  cdp.send('Input.dispatchTouchEvent', {
    type: frame.type,
    touchPoints: frame.points.map((point) => ({ id: point.id, x: point.x, y: point.y })),
  });

const play = async (page: Page, cdp: CDPSession, script: TouchScript): Promise<void> => {
  for (const gesture of script) {
    const startedAt = Date.now();
    for (const frame of touchFramesOf(gesture)) {
      await page.waitForTimeout(Math.max(0, startedAt + frame.at - Date.now()));
      await sendFrame(cdp, frame);
    }
    await page.waitForTimeout(Math.max(0, startedAt + durationOf(gesture) - Date.now()));
  }
};

const watchProblems = (page: Page, problems: string[]): void => {
  page.on('console', (message) => {
    if (message.type() === 'error') {
      problems.push(`console: ${message.text()}`);
    }
  });
  page.on('pageerror', (error) => {
    problems.push(`page error: ${error.message}`);
  });
};

const film = async (request: FilmRequest, problems: string[]): Promise<string> => {
  const script = TouchScriptSchema.parse(JSON.parse(await readFile(request.scriptPath, 'utf8')));
  const size = FILM_VIEWPORTS[request.viewport];
  const filmDir = path.join(OUT_DIR, `${request.name}-film`);
  await mkdir(filmDir, { recursive: true });
  const browser = await launchDevBrowser();
  try {
    const context = await browser.newContext({
      viewport: size,
      deviceScaleFactor: 2,
      hasTouch: true,
      isMobile: true,
      locale: DEV_LOCALE,
      recordVideo: { dir: filmDir, size },
    });
    context.setDefaultTimeout(STEP_TIMEOUT_MS);
    const page = await context.newPage();
    watchProblems(page, problems);
    if (request.login) {
      await signIn(page, request.baseUrl);
    }
    await page.goto(`${request.baseUrl}${request.route}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(SETTLE_MS);
    const cdp = await context.newCDPSession(page);
    await play(page, cdp, script);
    await page.waitForTimeout(SETTLE_MS);
    const video = page.video();
    await context.close();
    const recorded = await video?.path();
    if (recorded === undefined) {
      throw new Error('the browser recorded no film');
    }
    const target = path.join(filmDir, `${request.name}-${request.viewport}.webm`);
    await rename(recorded, target);

    return target;
  } finally {
    await browser.close();
  }
};

const run = async (): Promise<void> => {
  const problems: string[] = [];
  try {
    console.log(path.resolve(await film(parseFilmArgs(process.argv.slice(2)), problems)));
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  } finally {
    for (const problem of problems) {
      console.error(`! ${problem}`);
    }
  }
};

void run();
