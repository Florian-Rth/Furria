import { screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { writeGrantedToSession } from '@/features/preview-access';
import { currentSession, FOUNDING_YEAR, MEMBER_COUNT_PLACEHOLDER } from '@/lib/club';
import { renderAtRoute } from '@/test/render';

beforeEach(() => {
  writeGrantedToSession(window.sessionStorage);
});

afterEach(() => {
  window.sessionStorage.clear();
});

describe('LandingPage hero', () => {
  it('renders the GROSS FURRIA! poster headline as the page h1', async () => {
    renderAtRoute('/');

    expect(
      await screen.findByRole('heading', { level: 1, name: 'GROSS FURRIA!' }),
    ).toBeInTheDocument();
  });

  it('introduces the club with the Großbesenstadt intro paragraph', async () => {
    renderAtRoute('/');

    await screen.findByRole('heading', { level: 1, name: 'GROSS FURRIA!' });
    expect(screen.getByText('Großbesenstadt')).toBeInTheDocument();
  });

  it('links the two CTAs to the tickets and program routes', async () => {
    renderAtRoute('/');

    expect(await screen.findByRole('link', { name: 'Tickets sichern →' })).toHaveAttribute(
      'href',
      '/tickets',
    );
    expect(screen.getByRole('link', { name: 'Programm ansehen' })).toHaveAttribute(
      'href',
      '/program',
    );
  });

  it('derives the eyebrow badge from the current session', async () => {
    renderAtRoute('/');

    expect(
      await screen.findByText(`★ SESSION ${currentSession.yearsLabel} · 11.11. ERÖFFNUNG`),
    ).toBeInTheDocument();
  });

  it('shows the placeholder stat figures from the club globals', async () => {
    renderAtRoute('/');

    await screen.findByRole('heading', { level: 1, name: 'GROSS FURRIA!' });
    expect(screen.getByText(MEMBER_COUNT_PLACEHOLDER)).toBeInTheDocument();
    expect(screen.getByText('Mitglieder')).toBeInTheDocument();
    expect(screen.getByText('gegründet')).toBeInTheDocument();
  });

  it('renders the tilted garde photo placeholder in the photo column', async () => {
    renderAtRoute('/');

    await screen.findByRole('heading', { level: 1, name: 'GROSS FURRIA!' });
    expect(screen.getByText('garde-auf-der-buehne')).toBeInTheDocument();
  });

  it('tags the photo with the founding year', async () => {
    renderAtRoute('/');

    await screen.findByRole('heading', { level: 1, name: 'GROSS FURRIA!' });
    expect(screen.getByText(`Seit ${FOUNDING_YEAR}`)).toBeInTheDocument();
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
});
