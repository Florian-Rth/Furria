import { launchDevBrowser } from '../src/dev-session.ts';
const OUT = new URL('./', import.meta.url).pathname;
const who = process.env.WHO ?? 'sabine.roth';
const run = async (): Promise<void> => {
  const browser = await launchDevBrowser();
  for (const scheme of ['light', 'dark'] as const) {
    const context = await browser.newContext({ viewport: { width: 420, height: 740 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true, colorScheme: scheme, locale: 'de-DE' });
    const page = await context.newPage();
    page.on('pageerror', (e) => console.log('pageerror', e.message));
    await page.goto('http://localhost:3012/login?pwa=false', { waitUntil: 'load' });
    await page.waitForTimeout(1500);
    await page.getByLabel('E-Mail-Adresse', { exact: true }).fill(`${who}@furria.local`);
    await page.getByLabel('Passwort', { exact: true }).fill('Furria-Persona-1!');
    await page.getByRole('button', { name: 'Anmelden', exact: true }).click();
    await page.waitForURL((url) => !url.pathname.startsWith('/login'));
    await page.goto('http://localhost:3012/calendar?day=2026-12-12&entry=67&pwa=false', { waitUntil: 'load' });
    await page.waitForTimeout(3000);
    await page.mouse.move(210, 700);
    await page.mouse.wheel(0, 450); await page.waitForTimeout(700);
    await page.screenshot({ path: `${OUT}${who}-${scheme}.png` });
    if (who === 'sabine.roth' && scheme === 'light') {
      await page.goto('http://localhost:3012/calendar/67?pwa=false', { waitUntil: 'load' });
      await page.waitForTimeout(3000);
      await page.getByText('Welches Essen?').first().scrollIntoViewIfNeeded().catch(() => undefined);
      await page.waitForTimeout(500);
      await page.screenshot({ path: `${OUT}form-${scheme}.png` });
    }
    await context.close();
  }
  await browser.close();
};
void run();
