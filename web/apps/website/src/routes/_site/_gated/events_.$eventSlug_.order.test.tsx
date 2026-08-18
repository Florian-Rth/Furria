import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { writeGrantedToSession } from '@/features/preview-access';
import { markChangelogSeen } from '@/test/changelog';
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

describe('order flow route', () => {
  it('walks the three steps forward and lets the browser step back', async () => {
    const user = userEvent.setup();
    const { history } = renderOrderFlow('/events/prunksitzung-1-2027/order');

    expect(await screen.findByText('HIER WÄHLST DU DEINE KARTEN')).toBeInTheDocument();
    expect(screen.getByText('Schritt 1 von 3 · Kartenwahl')).toBeInTheDocument();
    expect(screen.getByText('14 € pro Karte')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Weiter zum Kauf →' }));
    expect(await screen.findByText('HIER KOMMEN DEINE DATEN HIN')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Weiter zur Zahlung →' }));
    expect(await screen.findByText('HIER WIRD BEZAHLT')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Zur Bestätigung →' })).toHaveAttribute(
      'href',
      '/orders/demo',
    );

    history.back();
    expect(await screen.findByText('HIER KOMMEN DEINE DATEN HIN')).toBeInTheDocument();

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

    expect(await screen.findByText('HIER KOMMEN DEINE DATEN HIN')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '← Zurück' }));
    expect(await screen.findByText('HIER WÄHLST DU DEINE KARTEN')).toBeInTheDocument();
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

    expect(await screen.findByText('HIER WIRD BEZAHLT')).toBeInTheDocument();
  });

  it('answers an unknown slug with the branded 404', async () => {
    renderOrderFlow('/events/prunksitzung-1-1971/order');

    expect(
      await screen.findByRole('heading', { level: 1, name: 'HIER WAR MAL EINE SEITE.' }),
    ).toBeInTheDocument();
  });
});
