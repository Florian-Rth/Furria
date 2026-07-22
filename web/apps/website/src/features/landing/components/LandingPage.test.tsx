import { screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { writeGrantedToSession } from '@/features/preview-access';
import { currentSession, MEMBER_COUNT_PLACEHOLDER } from '@/lib/club';
import { renderAtRoute } from '@/test/render';
import { DESKTOP_VIEWPORT_WIDTH, MOBILE_VIEWPORT_WIDTH, setViewportWidth } from '@/test/viewport';

const getDesktopHero = (): HTMLElement =>
  document.querySelector('[data-kk-landing-desktop-hero]') as HTMLElement;

const getMobileHero = (): HTMLElement =>
  document.querySelector('[data-kk-landing-mobile-hero]') as HTMLElement;

const getProgramTeaser = (): HTMLElement =>
  document.querySelector('[data-kk-program-teaser]') as HTMLElement;

beforeEach(() => {
  writeGrantedToSession(window.sessionStorage);
});

afterEach(() => {
  window.sessionStorage.clear();
});

describe('LandingPage hero', () => {
  beforeEach(() => {
    setViewportWidth(DESKTOP_VIEWPORT_WIDTH);
  });

  afterEach(() => {
    setViewportWidth(DESKTOP_VIEWPORT_WIDTH);
  });

  it('renders the GROSS FURRIA! poster headline as the page h1', async () => {
    renderAtRoute('/');

    await waitFor(() => expect(getDesktopHero()).not.toBeNull());
    expect(
      within(getDesktopHero()).getByRole('heading', { level: 1, name: 'GROSS FURRIA!' }),
    ).toBeInTheDocument();
  });

  it('introduces the club with the Großbesenstadt intro paragraph', async () => {
    renderAtRoute('/');

    await screen.findByRole('heading', { level: 1, name: 'GROSS FURRIA!' });
    expect(within(getDesktopHero()).getByText('Großbesenstadt')).toBeInTheDocument();
  });

  it('links the two CTAs to the tickets and program routes', async () => {
    renderAtRoute('/');

    await waitFor(() => expect(getDesktopHero()).not.toBeNull());
    expect(
      within(getDesktopHero()).getByRole('link', { name: 'Tickets sichern →' }),
    ).toHaveAttribute('href', '/tickets');
    expect(
      within(getDesktopHero()).getByRole('link', { name: 'Programm ansehen' }),
    ).toHaveAttribute('href', '/program');
  });

  it('derives the eyebrow badge from the current session', async () => {
    renderAtRoute('/');

    await screen.findByRole('heading', { level: 1, name: 'GROSS FURRIA!' });
    expect(
      within(getDesktopHero()).getByText(
        `★ SESSION ${currentSession.yearsLabel} · 11.11. ERÖFFNUNG`,
      ),
    ).toBeInTheDocument();
  });

  it('shows the placeholder stat figures from the club globals', async () => {
    renderAtRoute('/');

    await screen.findByRole('heading', { level: 1, name: 'GROSS FURRIA!' });
    expect(within(getDesktopHero()).getByText(MEMBER_COUNT_PLACEHOLDER)).toBeInTheDocument();
    expect(within(getDesktopHero()).getByText('Mitglieder')).toBeInTheDocument();
    expect(within(getDesktopHero()).getByText('gegründet')).toBeInTheDocument();
  });

  it('renders the tilted garde photo placeholder in the photo column', async () => {
    renderAtRoute('/');

    await screen.findByRole('heading', { level: 1, name: 'GROSS FURRIA!' });
    expect(within(getDesktopHero()).getByText('garde-auf-der-buehne')).toBeInTheDocument();
  });

  it('floats the 11.11 opening seal over the photo', async () => {
    renderAtRoute('/');

    await screen.findByRole('heading', { level: 1, name: 'GROSS FURRIA!' });
    expect(screen.getByText('11.11')).toBeInTheDocument();
  });

  it('paints a faint broom watermark behind the hero as a non-interactive decoration', async () => {
    renderAtRoute('/');

    await screen.findByRole('heading', { level: 1, name: 'GROSS FURRIA!' });
    const watermark = document.querySelector('[data-kk-hero-watermark]');
    expect(watermark).not.toBeNull();
    expect(watermark).toHaveAttribute('aria-hidden', 'true');
    expect(watermark).toHaveStyle({ pointerEvents: 'none' });
  });

  it('contains the confetti scatter to the photo column, never over the reading column', async () => {
    renderAtRoute('/');

    await screen.findByRole('heading', { level: 1, name: 'GROSS FURRIA!' });
    const textColumn = document.querySelector('[data-kk-hero-text]');
    const photoColumn = document.querySelector('[data-kk-hero-photo]');

    expect(textColumn?.querySelector('[data-kk-confetti-scatter]')).toBeNull();
    expect(photoColumn?.querySelector('[data-kk-confetti-scatter]')).not.toBeNull();
  });

  it('runs the brand ticker under the hero with the session label from the club globals', async () => {
    renderAtRoute('/');

    const heading = await screen.findByRole('heading', { level: 1, name: 'GROSS FURRIA!' });
    const ticker = document.querySelector('[data-kk-ticker]');
    expect(ticker).not.toBeNull();
    expect(
      heading.compareDocumentPosition(ticker as Node) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(screen.getAllByText(`SESSION ${currentSession.yearsLabel}`).length).toBeGreaterThan(0);
    expect(screen.getAllByText('GROSSBESENSTADT').length).toBeGreaterThan(0);
  });
});

describe('LandingPage program teaser', () => {
  beforeEach(() => {
    setViewportWidth(DESKTOP_VIEWPORT_WIDTH);
  });

  afterEach(() => {
    setViewportWidth(DESKTOP_VIEWPORT_WIDTH);
  });

  it('shows the DAS PROGRAMM section header', async () => {
    renderAtRoute('/');

    await waitFor(() => expect(getProgramTeaser()).not.toBeNull());
    expect(
      within(getProgramTeaser()).getByRole('heading', { level: 2, name: 'DAS PROGRAMM' }),
    ).toBeInTheDocument();
  });

  it('links Alle Termine → to the program route', async () => {
    renderAtRoute('/');

    await waitFor(() => expect(getProgramTeaser()).not.toBeNull());
    expect(
      within(getProgramTeaser()).getByRole('link', { name: 'Alle Termine →' }),
    ).toHaveAttribute('href', '/program');
  });

  it('renders all three upcoming event titles', async () => {
    renderAtRoute('/');

    await waitFor(() => expect(getProgramTeaser()).not.toBeNull());
    const teaser = within(getProgramTeaser());
    expect(teaser.getByText('Große Prunksitzung')).toBeInTheDocument();
    expect(teaser.getByText('Kinderfasching')).toBeInTheDocument();
    expect(teaser.getByText('Rosenmontagsumzug')).toBeInTheDocument();
  });

  it('renders a photo placeholder for each upcoming event', async () => {
    renderAtRoute('/');

    await waitFor(() => expect(getProgramTeaser()).not.toBeNull());
    expect(within(getProgramTeaser()).getAllByText('event-foto')).toHaveLength(3);
  });

  it('places the teaser after the brand ticker in document order', async () => {
    renderAtRoute('/');

    await waitFor(() => expect(getProgramTeaser()).not.toBeNull());
    const ticker = document.querySelector('[data-kk-ticker]');
    expect(ticker).not.toBeNull();
    expect(
      (ticker as Node).compareDocumentPosition(getProgramTeaser()) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });
});

describe('LandingPage mobile hero', () => {
  beforeEach(() => {
    setViewportWidth(MOBILE_VIEWPORT_WIDTH);
  });

  afterEach(() => {
    setViewportWidth(DESKTOP_VIEWPORT_WIDTH);
  });

  it('renders the GROSS FURRIA! poster headline as the page h1', async () => {
    renderAtRoute('/');

    await waitFor(() => expect(getMobileHero()).not.toBeNull());
    expect(
      within(getMobileHero()).getByRole('heading', { level: 1, name: 'GROSS FURRIA!' }),
    ).toBeInTheDocument();
  });

  it('derives the eyebrow badge from the current session', async () => {
    renderAtRoute('/');

    await waitFor(() => expect(getMobileHero()).not.toBeNull());
    expect(
      within(getMobileHero()).getByText(
        `★ SESSION ${currentSession.yearsLabel} · 11.11. ERÖFFNUNG`,
      ),
    ).toBeInTheDocument();
  });

  it('renders the full-bleed garde photo placeholder', async () => {
    renderAtRoute('/');

    await screen.findByRole('heading', { level: 1, name: 'GROSS FURRIA!' });
    expect(within(getMobileHero()).getByText('garde-auf-der-buehne')).toBeInTheDocument();
  });

  it('links the two CTAs to the tickets and program routes', async () => {
    renderAtRoute('/');

    await waitFor(() => expect(getMobileHero()).not.toBeNull());
    expect(
      within(getMobileHero()).getByRole('link', { name: 'Tickets sichern →' }),
    ).toHaveAttribute('href', '/tickets');
    expect(within(getMobileHero()).getByRole('link', { name: 'Programm ansehen' })).toHaveAttribute(
      'href',
      '/program',
    );
  });

  it('shows the placeholder stat figures from the club globals', async () => {
    renderAtRoute('/');

    await screen.findByRole('heading', { level: 1, name: 'GROSS FURRIA!' });
    expect(within(getMobileHero()).getByText(MEMBER_COUNT_PLACEHOLDER)).toBeInTheDocument();
    expect(within(getMobileHero()).getByText('Mitglieder')).toBeInTheDocument();
    expect(within(getMobileHero()).getByText('gegründet')).toBeInTheDocument();
  });

  it('runs the brand ticker below the mobile hero', async () => {
    renderAtRoute('/');

    const heading = await screen.findByRole('heading', { level: 1, name: 'GROSS FURRIA!' });
    const ticker = document.querySelector('[data-kk-ticker]');
    expect(ticker).not.toBeNull();
    expect(
      heading.compareDocumentPosition(ticker as Node) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });
});
