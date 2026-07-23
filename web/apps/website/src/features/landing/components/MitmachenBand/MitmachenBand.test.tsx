import { waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { mitmachenBandContent } from '@/features/landing/mitmachen-content';
import { writeGrantedToSession } from '@/features/preview-access';
import { renderAtRoute } from '@/test/render';
import { DESKTOP_VIEWPORT_WIDTH, MOBILE_VIEWPORT_WIDTH, setViewportWidth } from '@/test/viewport';

const getBand = (): HTMLElement =>
  document.querySelector('[data-kk-mitmachen-band]') as HTMLElement;

const getReflowRow = (): HTMLElement =>
  getBand().querySelector(':scope > div:not([data-kk-mitmachen-watermark])') as HTMLElement;

beforeEach(() => {
  writeGrantedToSession(window.sessionStorage);
});

afterEach(() => {
  window.sessionStorage.clear();
  setViewportWidth(DESKTOP_VIEWPORT_WIDTH);
});

describe('MitmachenBand', () => {
  beforeEach(() => {
    setViewportWidth(DESKTOP_VIEWPORT_WIDTH);
  });

  it('states the year-round mitmachen kicker', async () => {
    renderAtRoute('/');

    await waitFor(() => expect(getBand()).not.toBeNull());
    expect(within(getBand()).getByText(mitmachenBandContent.kicker)).toBeInTheDocument();
  });

  it('renders the WERD TEIL DER GARDE recruit headline', async () => {
    renderAtRoute('/');

    await waitFor(() => expect(getBand()).not.toBeNull());
    expect(
      within(getBand()).getByRole('heading', { level: 2, name: mitmachenBandContent.headline }),
    ).toBeInTheDocument();
  });

  it('names the club Gruppen in the invitation body', async () => {
    renderAtRoute('/');

    await waitFor(() => expect(getBand()).not.toBeNull());
    expect(within(getBand()).getByText(mitmachenBandContent.body)).toBeInTheDocument();
  });

  it('links the Mitglied werden CTA to the join funnel', async () => {
    renderAtRoute('/');

    await waitFor(() => expect(getBand()).not.toBeNull());
    expect(
      within(getBand()).getByRole('link', { name: mitmachenBandContent.ctaLabel }),
    ).toHaveAttribute('href', '/join');
  });

  it('paints a contained broom watermark as a non-interactive decoration', async () => {
    renderAtRoute('/');

    await waitFor(() => expect(getBand()).not.toBeNull());
    const watermark = getBand().querySelector('[data-kk-mitmachen-watermark]');
    expect(watermark).not.toBeNull();
    expect(watermark).toHaveAttribute('aria-hidden', 'true');
    expect(watermark).toHaveStyle({ pointerEvents: 'none' });
  });

  it('reflows text and CTA into a row at md and up', async () => {
    renderAtRoute('/');

    await waitFor(() => expect(getBand()).not.toBeNull());
    expect(window.getComputedStyle(getReflowRow()).flexDirection).toBe('row');
  });
});

describe('MitmachenBand on mobile', () => {
  beforeEach(() => {
    setViewportWidth(MOBILE_VIEWPORT_WIDTH);
  });

  it('stacks text above the CTA at xs', async () => {
    renderAtRoute('/');

    await waitFor(() => expect(getBand()).not.toBeNull());
    expect(window.getComputedStyle(getReflowRow()).flexDirection).toBe('column');
  });

  it('still links the Mitglied werden CTA to the join funnel', async () => {
    renderAtRoute('/');

    await waitFor(() => expect(getBand()).not.toBeNull());
    expect(
      within(getBand()).getByRole('link', { name: mitmachenBandContent.ctaLabel }),
    ).toHaveAttribute('href', '/join');
  });
});
