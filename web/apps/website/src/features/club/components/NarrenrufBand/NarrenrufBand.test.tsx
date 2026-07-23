import { within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { narrenrufBandContent } from '@/features/club/narrenruf-content';
import { renderWithProviders } from '@/test/render';
import { DESKTOP_VIEWPORT_WIDTH, MOBILE_VIEWPORT_WIDTH, setViewportWidth } from '@/test/viewport';
import { NarrenrufBand } from './NarrenrufBand';

const getBand = (): HTMLElement =>
  document.querySelector('[data-kk-narrenruf-band]') as HTMLElement;

const getRow = (): HTMLElement => getBand().querySelector('[data-kk-narrenruf-row]') as HTMLElement;

const getShout = (): HTMLElement =>
  getBand().querySelector('[data-kk-narrenruf-shout]') as HTMLElement;

afterEach(() => {
  setViewportWidth(DESKTOP_VIEWPORT_WIDTH);
});

describe('NarrenrufBand', () => {
  beforeEach(() => {
    setViewportWidth(DESKTOP_VIEWPORT_WIDTH);
  });

  it('states the exclusive-narrenruf kicker', () => {
    renderWithProviders(<NarrenrufBand />);

    expect(within(getBand()).getByText(narrenrufBandContent.kicker)).toBeInTheDocument();
  });

  it('renders the rejection sentence that points to Groß', () => {
    renderWithProviders(<NarrenrufBand />);

    expect(within(getBand()).getByText(narrenrufBandContent.sentence)).toBeInTheDocument();
  });

  it('shouts the club narrenruf Groß · Furria and never Helau or Alaaf', () => {
    renderWithProviders(<NarrenrufBand />);

    const shout = getShout();
    expect(within(shout).getByText(narrenrufBandContent.shoutLead)).toBeInTheDocument();
    expect(within(shout).getByText(narrenrufBandContent.shoutCall)).toBeInTheDocument();
    expect(shout.textContent).not.toMatch(/helau|alaaf/i);
  });

  it('is a display-only band with no call-to-action link', () => {
    renderWithProviders(<NarrenrufBand />);

    expect(within(getBand()).queryByRole('link')).not.toBeInTheDocument();
    expect(within(getBand()).queryByRole('button')).not.toBeInTheDocument();
  });

  it('paints a contained broom watermark as a non-interactive decoration', () => {
    renderWithProviders(<NarrenrufBand />);

    const watermark = getBand().querySelector('[data-kk-narrenruf-watermark]');
    expect(watermark).not.toBeNull();
    expect(watermark).toHaveAttribute('aria-hidden', 'true');
    expect(watermark).toHaveStyle({ pointerEvents: 'none' });
  });

  it('reflows copy and shout into a row at md and up', () => {
    renderWithProviders(<NarrenrufBand />);

    expect(window.getComputedStyle(getRow()).flexDirection).toBe('row');
  });
});

describe('NarrenrufBand on mobile', () => {
  beforeEach(() => {
    setViewportWidth(MOBILE_VIEWPORT_WIDTH);
  });

  it('stacks copy above the shout at xs', () => {
    renderWithProviders(<NarrenrufBand />);

    expect(window.getComputedStyle(getRow()).flexDirection).toBe('column');
  });
});
