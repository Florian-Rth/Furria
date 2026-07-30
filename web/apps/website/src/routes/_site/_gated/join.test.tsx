import { screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { kompassTitle } from '@/features/group-matcher/kompass-content';
import { joinClosingBandContent } from '@/features/membership/closing-content';
import { joinContactTitle } from '@/features/membership/contact-content';
import { joinFaqTitle } from '@/features/membership/faq-content';
import { joinPageTitle } from '@/features/membership/join-content';
import { JOIN_STEPS, joinStepsTitle } from '@/features/membership/steps-content';
import { membershipTicketTitle } from '@/features/membership/ticket-content';
import { writeGrantedToSession } from '@/features/preview-access';
import { CLUB_CONTACT_EMAIL, currentSession } from '@/lib/club';
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

  it('reads end to end in the order the funnel was shaped in', async () => {
    renderAtRoute('/join');

    await screen.findByRole('heading', { level: 1, name: joinPageTitle });

    const sectionTitles = screen
      .getAllByRole('heading', { level: 2 })
      .map((heading) => heading.textContent);

    expect(sectionTitles).toEqual([
      kompassTitle,
      membershipTicketTitle,
      joinStepsTitle,
      joinFaqTitle,
      joinContactTitle,
      joinClosingBandContent.headline,
    ]);
  });

  it('walks the four steps and opens the FAQ collapsed', async () => {
    renderAtRoute('/join');

    for (const step of JOIN_STEPS) {
      expect(
        await screen.findByRole('heading', { level: 3, name: step.title }),
      ).toBeInTheDocument();
    }

    expect(screen.getByRole('button', { name: 'Muss ich tanzen können?' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    expect(screen.getByRole('button', { name: 'Muss ich in eine Gruppe?' })).toBeInTheDocument();
  });

  it('closes with one contact channel, no phone number and the Antrag', async () => {
    renderAtRoute('/join');

    expect(await screen.findByRole('link', { name: CLUB_CONTACT_EMAIL })).toHaveAttribute(
      'href',
      `mailto:${CLUB_CONTACT_EMAIL}`,
    );
    expect(document.body.textContent).not.toContain('0170');
    expect(screen.getByRole('link', { name: joinClosingBandContent.ctaLabel })).toHaveAttribute(
      'href',
      '/join/apply',
    );
  });
});
