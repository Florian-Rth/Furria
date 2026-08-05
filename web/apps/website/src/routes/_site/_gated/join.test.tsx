import { screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { matcherTitle } from '@/features/group-matcher/matcher-content';
import { joinClosingBandContent } from '@/features/membership/closing-content';
import { joinContactTitle } from '@/features/membership/contact-content';
import { joinFaqTitle } from '@/features/membership/faq-content';
import { joinPageTitle } from '@/features/membership/join-content';
import { JOIN_STEPS, joinStepsTitle } from '@/features/membership/steps-content';
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
  it('leads with the page name and invites the visitor in', async () => {
    renderAtRoute('/join');

    expect(
      await screen.findByRole('heading', { level: 1, name: 'MITGLIED WERDEN' }),
    ).toBeInTheDocument();
    expect(screen.getByText('DU MÖCHTEST MITMACHEN?')).toBeInTheDocument();
  });

  it('offers the Antrag first and the Matcher as the low-commitment second step', async () => {
    renderAtRoute('/join');

    expect(await screen.findByRole('link', { name: 'Antrag stellen →' })).toHaveAttribute(
      'href',
      '/join/apply',
    );
    expect(screen.getByRole('link', { name: 'Wo passe ich hin? ↓' })).toHaveAttribute(
      'href',
      '#group-matcher',
    );
  });

  it('carries the Matcher section the hero points at', async () => {
    renderAtRoute('/join');

    const matcherLink = await screen.findByRole('link', { name: 'Wo passe ich hin? ↓' });
    const target = matcherLink.getAttribute('href')?.replace('#', '') ?? '';

    expect(await screen.findByRole('heading', { level: 2, name: 'WO PASSE ICH HIN?' })).toBe(
      document.getElementById(target)?.querySelector('h2'),
    );
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
      matcherTitle,
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
