import { screen } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { writeGrantedToSession } from '@/features/preview-access';
import { markChangelogSeen } from '@/test/changelog';
import { EMBARGOED_MECHANICS } from '@/test/embargo';
import { fieldByLabel } from '@/test/form';
import { headContent } from '@/test/head';
import type { RouteRenderResult } from '@/test/render';
import { renderAtRoute } from '@/test/render';

beforeEach(() => {
  markChangelogSeen();
});

afterEach(() => {
  window.sessionStorage.clear();
  window.localStorage.clear();
});

const renderOrderFlow = (path: string): RouteRenderResult => {
  writeGrantedToSession(window.sessionStorage);
  return renderAtRoute(path);
};

const stepRegionHeadlines = (): (string | null)[] =>
  screen.getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent);

const typeBuyerData = async (user: UserEvent): Promise<void> => {
  await user.type(fieldByLabel('Vorname'), 'Lena');
  await user.type(fieldByLabel('Nachname'), 'Brandt');
  await user.type(fieldByLabel('E-Mail-Adresse'), 'lena.brandt@example.de');
};

describe('order flow route', () => {
  it('walks the three steps forward and lets the browser step back', async () => {
    const user = userEvent.setup();
    const { history } = renderOrderFlow('/events/prunksitzung-1-2027/order');

    expect(await screen.findByText('HIER WÄHLST DU DEINE KARTEN')).toBeInTheDocument();
    expect(screen.getByText('Schritt 1 von 3 · Kartenwahl')).toBeInTheDocument();
    expect(screen.getByText('14 € pro Karte')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Weiter zum Kauf →' }));
    expect(await screen.findByText('WER BESTELLT?')).toBeInTheDocument();

    await typeBuyerData(user);
    await user.click(screen.getByRole('button', { name: 'Weiter zur Zahlung →' }));
    expect(await screen.findByText('DEINE BESTELLUNG')).toBeInTheDocument();
    expect(screen.getByText('HIER WIRD BEZAHLT')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Zur Bestätigung →' })).toBeDisabled();

    history.back();
    expect(await screen.findByText('WER BESTELLT?')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '← Zurück' }));
    expect(await screen.findByText('HIER WÄHLST DU DEINE KARTEN')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '← Zurück' })).not.toBeInTheDocument();
  });

  it('frames the first step with the facts of the evening', async () => {
    renderOrderFlow('/events/prunksitzung-1-2027/order');

    expect(
      await screen.findByRole('heading', { level: 1, name: 'DIE LETZTEN 18 KARTEN.' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('KARTENWAHL · SA., 23. JANUAR · 19:11 UHR · DORFGEMEINDEHAUS GROSSFURRA'),
    ).toBeInTheDocument();
    expect(screen.getByText('14 € pro Karte · 18 von 260 frei')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '← 1. Prunksitzung' })).toHaveAttribute(
      'href',
      '/events/prunksitzung-1-2027',
    );
  });

  it('sends a sold-out evening to the Kartenbörse instead of the Kartenwahl', async () => {
    renderOrderFlow('/events/weiberfasching-2027/order');

    expect(
      await screen.findByRole('heading', { level: 1, name: 'DIESER ABEND IST AUSVERKAUFT.' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Zur Kartenbörse →' })).toHaveAttribute(
      'href',
      '/events/exchange',
    );
    expect(screen.queryByRole('button', { name: 'Weiter zum Kauf →' })).not.toBeInTheDocument();
    expect(screen.queryByText('HIER WÄHLST DU DEINE KARTEN')).not.toBeInTheDocument();
  });

  it('names the presale date of an evening that cannot sell yet', async () => {
    renderOrderFlow('/events/rentnerfasching-2027/order');

    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: 'DER VORVERKAUF HAT NOCH NICHT BEGONNEN.',
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Der Vorverkauf startet am 10\.01\.2027 um 10:00 Uhr\./),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Zum Abend →' })).toHaveAttribute(
      'href',
      '/events/rentnerfasching-2027',
    );
  });

  it('steps back from a deep-linked step without a history entry to pop', async () => {
    const user = userEvent.setup();
    renderOrderFlow('/events/prunksitzung-1-2027/order?step=2');

    expect(await screen.findByText('WER BESTELLT?')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '← Zurück' }));
    expect(await screen.findByText('HIER WÄHLST DU DEINE KARTEN')).toBeInTheDocument();
  });

  it('keeps the buyer on the second step until the form holds up', async () => {
    const user = userEvent.setup();
    renderOrderFlow('/events/prunksitzung-1-2027/order?step=2');

    expect(await screen.findByText('WER BESTELLT?')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Weiter zur Zahlung →' }));

    expect(await screen.findByText('Bitte trag deinen Vornamen ein.')).toBeInTheDocument();
    expect(screen.getByText('Bitte trag deinen Nachnamen ein.')).toBeInTheDocument();
    expect(
      screen.getByText('Bitte trag eine E-Mail-Adresse ein, an die deine Bestellung gehen kann.'),
    ).toBeInTheDocument();
    expect(screen.getByText('WER BESTELLT?')).toBeInTheDocument();
    expect(screen.queryByText('HIER WIRD BEZAHLT')).not.toBeInTheDocument();
  });

  it('sends the cursor from the bottom bar into the first field it cannot accept', async () => {
    const user = userEvent.setup();
    renderOrderFlow('/events/prunksitzung-1-2027/order?step=2');

    await screen.findByText('WER BESTELLT?');
    await user.click(screen.getByRole('button', { name: 'Weiter zur Zahlung →' }));

    await screen.findByText('Bitte trag deinen Vornamen ein.');

    expect(fieldByLabel('Vorname')).toHaveFocus();
    expect(fieldByLabel('Vorname')).toBeInvalid();
    expect(fieldByLabel('Vorname')).toHaveAccessibleDescription('Bitte trag deinen Vornamen ein.');
  });

  it('names the address it cannot send a Bestellung to', async () => {
    const user = userEvent.setup();
    renderOrderFlow('/events/prunksitzung-1-2027/order?step=2');

    await screen.findByText('WER BESTELLT?');
    await user.type(fieldByLabel('Vorname'), 'Lena');
    await user.type(fieldByLabel('Nachname'), 'Brandt');
    await user.type(fieldByLabel('E-Mail-Adresse'), 'keine-mail');
    await user.click(screen.getByRole('button', { name: 'Weiter zur Zahlung →' }));

    expect(
      await screen.findByText(
        'Bitte trag eine E-Mail-Adresse ein, an die deine Bestellung gehen kann.',
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText('Bitte trag deinen Vornamen ein.')).not.toBeInTheDocument();
    expect(screen.getByText('WER BESTELLT?')).toBeInTheDocument();
  });

  it('carries the typed data to the payment step and keeps it on the way back', async () => {
    const user = userEvent.setup();
    renderOrderFlow('/events/prunksitzung-1-2027/order?step=2');

    await screen.findByText('WER BESTELLT?');
    await typeBuyerData(user);
    await user.click(screen.getByRole('button', { name: 'Weiter zur Zahlung →' }));

    expect(await screen.findByText('DEINE BESTELLUNG')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Zur Bestätigung →' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Zu deinen Daten →' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '← Zurück' }));

    expect(await screen.findByText('WER BESTELLT?')).toBeInTheDocument();
    expect(fieldByLabel('Vorname')).toHaveValue('Lena');
    expect(fieldByLabel('Nachname')).toHaveValue('Brandt');
    expect(fieldByLabel('E-Mail-Adresse')).toHaveValue('lena.brandt@example.de');
  });

  it('submits the buyer form from the Enter key too', async () => {
    const user = userEvent.setup();
    renderOrderFlow('/events/prunksitzung-1-2027/order?step=2');

    await screen.findByText('WER BESTELLT?');
    await typeBuyerData(user);
    await user.keyboard('{Enter}');

    expect(await screen.findByText('HIER WIRD BEZAHLT')).toBeInTheDocument();
  });

  it('offers no account and no consent the site cannot honour yet', async () => {
    renderOrderFlow('/events/prunksitzung-1-2027/order?step=2');

    await screen.findByText('WER BESTELLT?');

    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    expect(screen.queryByText(/anmelden|Login|registrier|Konto/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /AGB/i })).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Telefon/)).not.toBeInTheDocument();
  });

  it('names all three steps of the flow at once', async () => {
    renderOrderFlow('/events/prunksitzung-1-2027/order');

    expect(await screen.findByText('Kartenwahl')).toBeInTheDocument();
    expect(screen.getByText('Deine Daten')).toBeInTheDocument();
    expect(screen.getByText('Zahlung')).toBeInTheDocument();
  });

  it('lands on the first step when the step param is garbage', async () => {
    renderOrderFlow('/events/prunksitzung-1-2027/order?step=zwoelf');

    expect(await screen.findByText('HIER WÄHLST DU DEINE KARTEN')).toBeInTheDocument();
  });

  it('opens a deep link straight on the linked step', async () => {
    renderOrderFlow('/events/prunksitzung-1-2027/order?step=3');

    expect(await screen.findByText('Schritt 3 von 3 · Zahlung')).toBeInTheDocument();
  });

  it('names what a deep link without buyer data is missing instead of pretending an order', async () => {
    renderOrderFlow('/events/prunksitzung-1-2027/order?step=3');

    expect(await screen.findByText('DEINE DATEN FEHLEN NOCH')).toBeInTheDocument();
    expect(screen.queryByText('DEINE BESTELLUNG')).not.toBeInTheDocument();
    expect(screen.queryByText('HIER WIRD BEZAHLT')).not.toBeInTheDocument();
    expect(screen.queryByText('HIER STEHEN DEINE KARTEN')).not.toBeInTheDocument();
    expect(screen.queryByText(/§ 312g Abs\. 2 Nr\. 9 BGB/)).not.toBeInTheDocument();
  });

  it('sends a deep link without buyer data back to the buyer step', async () => {
    const user = userEvent.setup();
    renderOrderFlow('/events/prunksitzung-1-2027/order?step=3');

    await screen.findByText('DEINE DATEN FEHLEN NOCH');

    expect(screen.queryByRole('button', { name: 'Zur Bestätigung →' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Zu deinen Daten →' }));

    expect(await screen.findByText('WER BESTELLT?')).toBeInTheDocument();
  });

  it('summarises the evening and the typed data before it mentions paying', async () => {
    const user = userEvent.setup();
    renderOrderFlow('/events/prunksitzung-1-2027/order?step=2');

    await screen.findByText('WER BESTELLT?');
    await typeBuyerData(user);
    await user.click(screen.getByRole('button', { name: 'Weiter zur Zahlung →' }));

    expect(await screen.findByText('DEINE BESTELLUNG')).toBeInTheDocument();
    for (const label of ['Abend', 'Termin', 'Ort', 'Bestellt von', 'E-Mail']) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
    expect(screen.getByText('1. Prunksitzung')).toBeInTheDocument();
    expect(screen.getByText('Sa., 23. Januar 2027 · 19:11 Uhr')).toBeInTheDocument();
    expect(screen.getByText('Dorfgemeindehaus Großfurra')).toBeInTheDocument();
    expect(screen.getByText('Lena Brandt')).toBeInTheDocument();
    expect(screen.getByText('lena.brandt@example.de')).toBeInTheDocument();
    expect(stepRegionHeadlines()).toEqual([
      'DEINE BESTELLUNG',
      'HIER STEHEN DEINE KARTEN',
      'HIER WIRD BEZAHLT',
    ]);
  });

  it('marks the Karten line and the payment region as the parts that are still waiting', async () => {
    const user = userEvent.setup();
    renderOrderFlow('/events/prunksitzung-1-2027/order?step=2');

    await screen.findByText('WER BESTELLT?');
    await typeBuyerData(user);
    await user.click(screen.getByRole('button', { name: 'Weiter zur Zahlung →' }));

    expect(await screen.findByText('HIER STEHEN DEINE KARTEN')).toBeInTheDocument();
    expect(screen.getByText('HIER WIRD BEZAHLT')).toBeInTheDocument();
    expect(screen.getAllByText('PLATZHALTER')).toHaveLength(2);
    expect(screen.getByText(/Solange fehlt auch die Summe/)).toBeInTheDocument();
    expect(screen.getByText(/bewegt sich hier kein Geld/)).toBeInTheDocument();
    expect(screen.queryByText(/legt der Verein noch fest/)).not.toBeInTheDocument();
    expect(screen.getAllByText('14 € pro Karte')).toHaveLength(2);
  });

  it('states the Widerruf exemption as a standing note on the same screen as the pay action', async () => {
    const user = userEvent.setup();
    renderOrderFlow('/events/prunksitzung-1-2027/order?step=2');

    await screen.findByText('WER BESTELLT?');
    await typeBuyerData(user);
    await user.click(screen.getByRole('button', { name: 'Weiter zur Zahlung →' }));

    expect(await screen.findByText('KEIN WIDERRUFSRECHT')).toBeInTheDocument();
    expect(screen.getByRole('note')).toHaveTextContent(/§ 312g Abs\. 2 Nr\. 9 BGB/);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /AGB/i })).not.toBeInTheDocument();
  });

  it('leads nowhere and never claims an obligation to pay while payment is a placeholder', async () => {
    const user = userEvent.setup();
    renderOrderFlow('/events/prunksitzung-1-2027/order?step=2');

    await screen.findByText('WER BESTELLT?');
    await typeBuyerData(user);
    await user.click(screen.getByRole('button', { name: 'Weiter zur Zahlung →' }));

    await screen.findByText('HIER WIRD BEZAHLT');

    expect(screen.getByRole('button', { name: 'Zur Bestätigung →' })).toBeDisabled();
    expect(document.querySelector('a[href^="/orders/"]')).toBeNull();
    expect(screen.queryByText(/zahlungspflichtig/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /zahlungspflichtig/i })).not.toBeInTheDocument();
  });

  it('names no payment method and no entry mechanic on the payment step', async () => {
    const user = userEvent.setup();
    renderOrderFlow('/events/prunksitzung-1-2027/order?step=2');

    await screen.findByText('WER BESTELLT?');
    await typeBuyerData(user);
    await user.click(screen.getByRole('button', { name: 'Weiter zur Zahlung →' }));

    await screen.findByText('HIER WIRD BEZAHLT');

    expect(document.body.textContent).not.toMatch(EMBARGOED_MECHANICS);
  });

  it('keeps the transactional flow out of the search index', async () => {
    renderOrderFlow('/events/prunksitzung-1-2027/order');

    await screen.findByText('HIER WÄHLST DU DEINE KARTEN');

    expect(headContent('meta[name="robots"]', 'content')).toBe('noindex');
    expect(headContent('link[rel="canonical"]', 'href')).toBeNull();
  });

  it('answers an unknown slug with the branded 404', async () => {
    renderOrderFlow('/events/prunksitzung-1-1971/order');

    expect(
      await screen.findByRole('heading', { level: 1, name: 'HIER WAR MAL EINE SEITE.' }),
    ).toBeInTheDocument();
  });
});
