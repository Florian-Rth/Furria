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
});
