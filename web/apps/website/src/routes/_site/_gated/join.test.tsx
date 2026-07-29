import { screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { writeGrantedToSession } from '@/features/preview-access';
import { currentSession } from '@/lib/club';
import { markChangelogSeen } from '@/test/changelog';
import { renderAtRoute } from '@/test/render';

beforeEach(() => {
  markChangelogSeen();
  writeGrantedToSession(window.sessionStorage);
});

afterEach(() => {
  window.sessionStorage.clear();
  window.localStorage.clear();
});

describe('join route', () => {
  it('leads with the thesis headline and the running Session', async () => {
    renderAtRoute('/join');

    expect(
      await screen.findByRole('heading', { level: 1, name: 'DU MUSST NICHT TANZEN KÖNNEN.' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(`MITGLIED WERDEN · SESSION ${currentSession.yearsLabel}`),
    ).toBeInTheDocument();
  });

  it('offers the Antrag first and the Kompass as the low-commitment second step', async () => {
    renderAtRoute('/join');

    expect(await screen.findByRole('link', { name: 'Antrag stellen →' })).toHaveAttribute(
      'href',
      '/join/apply',
    );
    expect(screen.getByRole('link', { name: 'Wo passe ich hin? ↓' })).toHaveAttribute(
      'href',
      '#konfetti-kompass',
    );
  });

  it('carries the Kompass section the hero points at', async () => {
    renderAtRoute('/join');

    const kompassLink = await screen.findByRole('link', { name: 'Wo passe ich hin? ↓' });
    const target = kompassLink.getAttribute('href')?.replace('#', '') ?? '';

    expect(await screen.findByRole('heading', { level: 2, name: 'WO PASSE ICH HIN?' })).toBe(
      document.getElementById(target)?.querySelector('h2'),
    );
  });

  it('lays the Ticket on the page as a second way into the Antrag', async () => {
    renderAtRoute('/join');

    expect(await screen.findByRole('link', { name: 'Antrag stellen' })).toHaveAttribute(
      'href',
      '/join/apply',
    );
    expect(
      screen.getByRole('heading', { level: 2, name: 'ALLES AUF EINER KARTE.' }),
    ).toBeInTheDocument();
  });

  it('shows three derived stats and no invented fourth one', async () => {
    renderAtRoute('/join');

    expect(await screen.findByText('Mitglieder')).toBeInTheDocument();
    expect(screen.getByText('Garden & Gruppen')).toBeInTheDocument();
    expect(screen.getByText(`${currentSession.number}.`)).toBeInTheDocument();
    expect(document.querySelectorAll('[data-kk-stat-row-item]')).toHaveLength(3);
  });
});
