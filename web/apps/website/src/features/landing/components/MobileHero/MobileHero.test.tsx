import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '@/test/render';
import { eyebrowLabel } from '../../hero-content';
import { MobileHero } from './MobileHero';

const renderMobileHero = (): void => {
  renderWithProviders(
    <MobileHero>
      <MobileHero.Photo />
      <MobileHero.Content>
        <MobileHero.Eyebrow />
        <MobileHero.Headline />
      </MobileHero.Content>
    </MobileHero>,
  );
};

describe('MobileHero', () => {
  it('renders the GROSS FURRIA! poster headline as an h1', () => {
    renderMobileHero();

    expect(screen.getByRole('heading', { level: 1, name: 'GROSS FURRIA!' })).toBeInTheDocument();
  });

  it('derives the eyebrow text from the current session', () => {
    renderMobileHero();

    expect(screen.getByText(eyebrowLabel)).toBeInTheDocument();
  });

  it('renders the full-bleed garde photo placeholder', () => {
    renderMobileHero();

    const photo = document.querySelector('[data-kk-mobile-hero-photo]');
    expect(screen.getByText('garde-auf-der-buehne')).toBeInTheDocument();
    expect(photo).toHaveStyle('position: absolute; inset: 0;');
  });

  it('paints an aria-hidden legibility scrim over the photo', () => {
    renderMobileHero();

    const scrim = document.querySelector('[data-kk-mobile-hero-scrim]');
    expect(scrim).not.toBeNull();
    expect(scrim).toHaveAttribute('aria-hidden', 'true');
  });

  it('layers the photo behind the scrim behind the pinned content by z-index', () => {
    renderMobileHero();

    const photo = document.querySelector('[data-kk-mobile-hero-photo]');
    const scrim = document.querySelector('[data-kk-mobile-hero-scrim]');
    const content = document.querySelector('[data-kk-mobile-hero-content]');

    expect(photo).toHaveStyle({ zIndex: '0' });
    expect(scrim).toHaveStyle({ zIndex: '1' });
    expect(content).toHaveStyle({ zIndex: '2' });
  });
});
