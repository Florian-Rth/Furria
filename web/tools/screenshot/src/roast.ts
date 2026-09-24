import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import type { Browser, Page } from 'playwright';
import { chromium } from 'playwright';

const BASE = 'http://localhost:3001';
const OUT = process.env.ROAST_OUT ?? 'roast-out';
const ONLY = process.env.ROAST_ONLY ?? '';
const VIEWPORT = process.env.ROAST_VIEWPORT ?? 'desktop';

const signIn = async (page: Page): Promise<void> => {
  await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
  await page.getByLabel('E-Mail-Adresse', { exact: true }).fill('admin@furria.local');
  await page.getByLabel('Passwort', { exact: true }).fill('Furria-Dev-Admin-1!');
  await page.getByRole('button', { name: 'Anmelden' }).click();
  await page.waitForURL((url) => !url.pathname.startsWith('/login'), { timeout: 20000 });
};

const settle = (page: Page): Promise<void> => page.waitForTimeout(1200);

const go = async (page: Page, route: string): Promise<void> => {
  await page.goto(`${BASE}${route}`, { waitUntil: 'domcontentloaded' });
  await settle(page);
};

const press = async (page: Page, name: string | RegExp, index = 0): Promise<void> => {
  await page.getByRole('button', { name }).nth(index).click({ timeout: 8000 });
  await settle(page);
};

interface Scene {
  readonly name: string;
  readonly run: (page: Page) => Promise<void>;
}

const HUB = '/groups/4';
const PERSON = '/manage/persons/2';

const scenes: Scene[] = [
  { name: 'a1-hub-resting', run: (p) => go(p, HUB) },
  {
    name: 'a2-hub-care-editing',
    run: async (p) => {
      await go(p, HUB);
      await press(p, 'Pflegen');
    },
  },
  {
    name: 'a3-hub-rhythm-dialog',
    run: async (p) => {
      await go(p, HUB);
      await press(p, 'Trainingszeit hinzufügen');
    },
  },
  {
    name: 'a4-hub-add-member',
    run: async (p) => {
      await go(p, HUB);
      await press(p, /Person aufnehmen|Aufnehmen|Mitglied/);
    },
  },
  {
    name: 'a5-hub-generator',
    run: async (p) => {
      await go(p, HUB);
      await press(p, 'Trainings erzeugen');
    },
  },
  { name: 'b1-person-resting', run: (p) => go(p, PERSON) },
  {
    name: 'b2-person-masterdata-dialog',
    run: async (p) => {
      await go(p, PERSON);
      await press(p, 'Bearbeiten');
    },
  },
  {
    name: 'b3-person-membership-inline',
    run: async (p) => {
      await go(p, PERSON);
      await press(p, /^Ändern/);
    },
  },
  {
    name: 'b4-person-membership-add',
    run: async (p) => {
      await go(p, PERSON);
      await press(p, /Zeitraum hinzufügen|^Zeitraum$/);
    },
  },
  {
    name: 'b5-person-pause-add',
    run: async (p) => {
      await go(p, PERSON);
      await press(p, /Ruhezeit/);
    },
  },
  { name: 'c1-manage-groups', run: (p) => go(p, '/manage/groups') },
  {
    name: 'c2-manage-groups-edit',
    run: async (p) => {
      await go(p, '/manage/groups');
      await press(p, 'Bearbeiten');
    },
  },
  { name: 'c3-manage-venues', run: (p) => go(p, '/manage/venues') },
  {
    name: 'c4-manage-venues-edit',
    run: async (p) => {
      await go(p, '/manage/venues');
      await press(p, 'Bearbeiten');
    },
  },
  { name: 'c5-manage-roles', run: (p) => go(p, '/manage/roles') },
  { name: 'c6-manage-board', run: (p) => go(p, '/manage/board') },
  { name: 'c7-manage-keys', run: (p) => go(p, '/manage/keys') },
  { name: 'c8-manage-sessions', run: (p) => go(p, '/manage/sessions') },
  { name: 'c9-manage-persons-list', run: (p) => go(p, '/manage/persons') },
  { name: 'd1-announcements', run: (p) => go(p, '/announcements') },
  {
    name: 'd2-announcement-sheet',
    run: async (p) => {
      await go(p, '/announcements');
      await press(p, 'Aushang schreiben');
    },
  },
  {
    name: 'd3-announcement-edit-sheet',
    run: async (p) => {
      await go(p, '/announcements');
      await press(p, /^Ändern$/);
    },
  },
  { name: 'e1-calendar', run: (p) => go(p, '/calendar') },
  {
    name: 'e2-calendar-dialog',
    run: async (p) => {
      await go(p, '/calendar');
      await press(p, /Termin eintragen|^Termin$/);
    },
  },
  { name: 'f1-profile', run: (p) => go(p, '/profile') },
  { name: 'f2-club', run: (p) => go(p, '/club') },
  { name: 'f3-members', run: (p) => go(p, '/members') },
];

const sizes: Record<string, { width: number; height: number }> = {
  desktop: { width: 1400, height: 1000 },
  phone: { width: 390, height: 844 },
};

const run = async (): Promise<void> => {
  const outDir = path.resolve(OUT);
  await mkdir(outDir, { recursive: true });
  const browser: Browser = await chromium.launch({ channel: 'chrome' });
  const size = sizes[VIEWPORT] ?? sizes.desktop;
  const context = await browser.newContext({ viewport: size, colorScheme: 'light' });
  context.setDefaultTimeout(10000);
  const page = await context.newPage();
  await signIn(page);

  const wanted = ONLY === '' ? scenes : scenes.filter((s) => ONLY.split(',').includes(s.name));

  for (const scene of wanted) {
    try {
      await scene.run(page);
      await page.screenshot({
        path: path.join(outDir, `${scene.name}-${VIEWPORT}.png`),
        fullPage: true,
      });
      process.stdout.write(`ok   ${scene.name}\n`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      process.stdout.write(`FAIL ${scene.name}: ${message.split('\n')[0]}\n`);
    }
  }

  await context.close();
  await browser.close();
};

await run();
