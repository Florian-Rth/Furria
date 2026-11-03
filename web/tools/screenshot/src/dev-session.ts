import type { Browser, Page } from 'playwright';
import { chromium } from 'playwright';

const DEV_EMAIL = 'admin@furria.local';
const DEV_PASSWORD = 'Furria-Dev-Admin-1!';
const DEFAULT_CHANNEL = 'chrome';

export const DEV_LOCALE = 'de-DE';

export const launchDevBrowser = (): Promise<Browser> =>
  chromium.launch({ channel: process.env.SHOT_BROWSER_CHANNEL ?? DEFAULT_CHANNEL });

export const signIn = async (page: Page, baseUrl: string): Promise<void> => {
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
