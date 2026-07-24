import { waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { recruitBandContent } from '@/features/club/recruit-content';
import { writeGrantedToSession } from '@/features/preview-access';
import { renderAtRoute } from '@/test/render';
import { DESKTOP_VIEWPORT_WIDTH, MOBILE_VIEWPORT_WIDTH, setViewportWidth } from '@/test/viewport';

const getBand = (): HTMLElement => document.querySelector('[data-kk-recruit-band]') as HTMLElement;

beforeEach(() => {
  writeGrantedToSession(window.sessionStorage);
  setViewportWidth(DESKTOP_VIEWPORT_WIDTH);
});

afterEach(() => {
  window.sessionStorage.clear();
  setViewportWidth(DESKTOP_VIEWPORT_WIDTH);
});

describe('RecruitBand', () => {
  it('states the Beitrag tiers in the kicker', async () => {
    renderAtRoute('/club');

    await waitFor(() => expect(getBand()).not.toBeNull());
    expect(within(getBand()).getByText(recruitBandContent.kicker)).toBeInTheDocument();
  });

  it('renders the WERDE TEIL VON FURRIA recruit headline', async () => {
    renderAtRoute('/club');

    await waitFor(() => expect(getBand()).not.toBeNull());
    expect(
      within(getBand()).getByRole('heading', { level: 2, name: recruitBandContent.headline }),
    ).toBeInTheDocument();
  });

  it('links the primary button to the join funnel', async () => {
    renderAtRoute('/club');

    await waitFor(() => expect(getBand()).not.toBeNull());
    expect(
      within(getBand()).getByRole('link', { name: recruitBandContent.primaryLabel }),
    ).toHaveAttribute('href', '/join');
  });

  it('links the secondary button to the season programme', async () => {
    renderAtRoute('/club');

    await waitFor(() => expect(getBand()).not.toBeNull());
    expect(
      within(getBand()).getByRole('link', { name: recruitBandContent.secondaryLabel }),
    ).toHaveAttribute('href', '/program');
  });

  it('paints a contained broom watermark as a non-interactive decoration', async () => {
    renderAtRoute('/club');

    await waitFor(() => expect(getBand()).not.toBeNull());
    const watermark = getBand().querySelector('[data-kk-recruit-watermark]');
    expect(watermark).not.toBeNull();
    expect(watermark).toHaveAttribute('aria-hidden', 'true');
    expect(watermark).toHaveStyle({ pointerEvents: 'none' });
  });
});

describe('RecruitBand on mobile', () => {
  beforeEach(() => {
    setViewportWidth(MOBILE_VIEWPORT_WIDTH);
  });

  it('still links both CTAs to their funnels at xs', async () => {
    renderAtRoute('/club');

    await waitFor(() => expect(getBand()).not.toBeNull());
    expect(
      within(getBand()).getByRole('link', { name: recruitBandContent.primaryLabel }),
    ).toHaveAttribute('href', '/join');
    expect(
      within(getBand()).getByRole('link', { name: recruitBandContent.secondaryLabel }),
    ).toHaveAttribute('href', '/program');
  });
});
