import { screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { writeGrantedToSession } from '@/features/preview-access';
import { CLUB_CONTACT_EMAIL } from '@/lib/club';
import { DEMO_ORDER_CODE } from '@/lib/seed/orders';
import { pageTitle } from '@/lib/seo';
import { markChangelogSeen } from '@/test/changelog';
import { EMBARGOED_MECHANICS, PLATZ_LANGUAGE } from '@/test/embargo';
import { headContent } from '@/test/head';
import { renderAtRoute } from '@/test/render';

beforeEach(() => {
  markChangelogSeen();
});

afterEach(() => {
  window.sessionStorage.clear();
  window.localStorage.clear();
});

const renderOrder = (path: string): void => {
  writeGrantedToSession(window.sessionStorage);
  renderAtRoute(path);
};

const pageText = (): string => document.body.textContent ?? '';

describe('order confirmation route', () => {
  it('renders the paid Bestellung the mail links to', async () => {
    renderOrder('/orders/demo');

    expect(
      await screen.findByRole('heading', { level: 1, name: 'DEINE KARTEN SIND DIR SICHER.' }),
    ).toBeInTheDocument();
    expect(screen.getByText('BEZAHLT')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'DEINE BESTELLUNG' })).toBeInTheDocument();
    expect(screen.getByText('1. Prunksitzung')).toBeInTheDocument();
    expect(screen.getByText('Sa., 23. Januar 2027 · 19:11 Uhr')).toBeInTheDocument();
    expect(screen.getByText('2 Karten · 14 € pro Karte')).toBeInTheDocument();
    expect(screen.getByText('28 €')).toBeInTheDocument();
    expect(screen.getByText('Max Mustermann')).toBeInTheDocument();
    expect(screen.getByText('max.mustermann@example.org')).toBeInTheDocument();
  });

  it('marks the reachable demo Bestellung as an invented example', async () => {
    renderOrder('/orders/demo');

    await screen.findByRole('heading', { level: 1, name: 'DEINE KARTEN SIND DIR SICHER.' });

    expect(screen.getByText('BEISPIELBESTELLUNG')).toBeInTheDocument();
    expect(screen.getByRole('note')).toHaveTextContent(/erfunden/);
    expect(screen.getByRole('note')).toHaveTextContent(/kein Geld/);
  });

  it('points onward to another purchasable evening and to the Kartenbörse', async () => {
    renderOrder('/orders/demo');

    await screen.findByRole('heading', { level: 1, name: 'DEINE KARTEN SIND DIR SICHER.' });

    expect(screen.getByRole('link', { name: 'Karten wählen →' })).toHaveAttribute(
      'href',
      '/events/prunksitzung-2-2027/order',
    );
    expect(screen.getByRole('link', { name: 'Zur Kartenbörse →' })).toHaveAttribute(
      'href',
      '/events/exchange',
    );
  });

  it('promises nothing about how anybody gets in', async () => {
    renderOrder('/orders/demo');

    await screen.findByRole('heading', { level: 1, name: 'DEINE KARTEN SIND DIR SICHER.' });

    expect(pageText()).not.toMatch(EMBARGOED_MECHANICS);
    expect(pageText()).not.toMatch(PLATZ_LANGUAGE);
    expect(pageText()).not.toMatch(/zahlungspflichtig/i);
  });

  it('never prints the capability code as a field of the Bestellung', async () => {
    renderOrder('/orders/demo');

    await screen.findByRole('heading', { level: 1, name: 'DEINE KARTEN SIND DIR SICHER.' });

    for (const row of document.querySelectorAll('[data-kk-summary-row]')) {
      expect(row.textContent ?? '').not.toContain(DEMO_ORDER_CODE);
    }
  });

  it('keeps the capability URL out of the search index', async () => {
    renderOrder('/orders/demo');

    await screen.findByRole('heading', { level: 1, name: 'DEINE KARTEN SIND DIR SICHER.' });

    expect(document.title).toBe(pageTitle('Deine Bestellung'));
    expect(headContent('meta[name="robots"]', 'content')).toBe('noindex');
    expect(headContent('link[rel="canonical"]', 'href')).toBeNull();
  });

  it('fails honestly on a code no Bestellung answers to', async () => {
    renderOrder('/orders/xyz789');

    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: 'WIR FINDEN ZU DIESEM LINK KEINE BESTELLUNG.',
      }),
    ).toBeInTheDocument();
    expect(screen.getByText('DA STIMMT WAS NICHT')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: CLUB_CONTACT_EMAIL })).toHaveAttribute(
      'href',
      `mailto:${CLUB_CONTACT_EMAIL}`,
    );
    expect(screen.getByRole('link', { name: 'Zu den Veranstaltungen →' })).toHaveAttribute(
      'href',
      '/events',
    );
    expect(screen.queryByRole('link', { name: 'Zur Kartenbörse →' })).not.toBeInTheDocument();
    expect(document.querySelector('[data-kk-order-panel]')).toBeNull();
    expect(document.querySelector('[data-kk-order-demo-notice]')).toBeNull();
    expect(headContent('meta[name="robots"]', 'content')).toBe('noindex');
  });
});
