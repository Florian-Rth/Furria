import { screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { clubHeroEyebrow } from '@/features/club/hero-content';
import { writeGrantedToSession } from '@/features/preview-access';
import { renderAtRoute } from '@/test/render';
import { DESKTOP_VIEWPORT_WIDTH, MOBILE_VIEWPORT_WIDTH, setViewportWidth } from '@/test/viewport';

const getHero = (): HTMLElement => document.querySelector('[data-kk-club-hero]') as HTMLElement;

beforeEach(() => {
  writeGrantedToSession(window.sessionStorage);
  setViewportWidth(DESKTOP_VIEWPORT_WIDTH);
});

afterEach(() => {
  window.sessionStorage.clear();
  setViewportWidth(DESKTOP_VIEWPORT_WIDTH);
});

describe('ClubPage hero', () => {
  it('renders the club hero instead of the in-progress placeholder', async () => {
    renderAtRoute('/club');

    await waitFor(() => expect(getHero()).not.toBeNull());
    expect(screen.queryByText('Diese Seite entsteht gerade.')).not.toBeInTheDocument();
  });

  it('shows the eyebrow derived from the Verein and current session number', async () => {
    renderAtRoute('/club');

    await waitFor(() => expect(getHero()).not.toBeNull());
    expect(within(getHero()).getByText(clubHeroEyebrow)).toBeInTheDocument();
  });

  it('renders the two-tone headline as the page heading', async () => {
    renderAtRoute('/club');

    await waitFor(() => expect(getHero()).not.toBeNull());
    expect(
      within(getHero()).getByRole('heading', {
        level: 1,
        name: 'DIE FÜNFTE JAHRESZEIT HAT EIN ZUHAUSE.',
      }),
    ).toBeInTheDocument();
  });

  it('links the primary CTA to the join funnel', async () => {
    renderAtRoute('/club');

    await waitFor(() => expect(getHero()).not.toBeNull());
    expect(within(getHero()).getByRole('link', { name: 'Mitglied werden →' })).toHaveAttribute(
      'href',
      '/join',
    );
  });

  it('links the secondary CTA to the season programme', async () => {
    renderAtRoute('/club');

    await waitFor(() => expect(getHero()).not.toBeNull());
    expect(within(getHero()).getByRole('link', { name: 'Zum Programm' })).toHaveAttribute(
      'href',
      '/program',
    );
  });

  it('sets the Verein page title and social meta', async () => {
    renderAtRoute('/club');

    await waitFor(() => expect(getHero()).not.toBeNull());
    expect(document.title).toBe('Verein · FURRIA');
    expect(document.querySelector('meta[name="description"]')?.getAttribute('content')).toContain(
      'Furrsche Carnevals Club',
    );
    expect(document.querySelector('meta[property="og:title"]')?.getAttribute('content')).toBe(
      'Verein · FURRIA',
    );
    expect(
      document.querySelector('meta[property="og:description"]')?.getAttribute('content'),
    ).toContain('Verein');
  });
});

describe('ClubPage hero on mobile', () => {
  beforeEach(() => {
    setViewportWidth(MOBILE_VIEWPORT_WIDTH);
  });

  it('hides the desktop-only ribbon at xs', async () => {
    renderAtRoute('/club');

    await waitFor(() => expect(getHero()).not.toBeNull());
    const ribbon = getHero().querySelector('[data-kk-club-ribbon]') as HTMLElement;
    expect(ribbon).not.toBeNull();
    expect(window.getComputedStyle(ribbon).display).toBe('none');
  });
});

const SECTION_ORDER = [
  '[data-kk-club-hero]',
  '[data-kk-club-story]',
  '[data-kk-narrenruf-band]',
  '[data-kk-chronik]',
  '[data-kk-season]',
  '[data-kk-gruppen]',
  '[data-kk-people]',
  '[data-kk-recruit-band]',
];

const readSectionOrder = (): string[] => {
  const nodes = Array.from(document.querySelectorAll(SECTION_ORDER.join(',')));
  return SECTION_ORDER.filter((selector) => nodes.some((node) => node.matches(selector))).sort(
    (a, b) => {
      const nodeA = document.querySelector(a) as Node;
      const nodeB = document.querySelector(b) as Node;
      const relation = nodeA.compareDocumentPosition(nodeB);
      return relation & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
    },
  );
};

describe('ClubPage section order', () => {
  it('renders every editorial section top to bottom at desktop', async () => {
    setViewportWidth(DESKTOP_VIEWPORT_WIDTH);
    renderAtRoute('/club');

    await waitFor(() => expect(getHero()).not.toBeNull());
    await waitFor(() => expect(document.querySelector('[data-kk-recruit-band]')).not.toBeNull());
    expect(readSectionOrder()).toEqual(SECTION_ORDER);
  });

  it('renders every editorial section top to bottom at mobile', async () => {
    setViewportWidth(MOBILE_VIEWPORT_WIDTH);
    renderAtRoute('/club');

    await waitFor(() => expect(getHero()).not.toBeNull());
    await waitFor(() => expect(document.querySelector('[data-kk-recruit-band]')).not.toBeNull());
    expect(readSectionOrder()).toEqual(SECTION_ORDER);
  });
});
