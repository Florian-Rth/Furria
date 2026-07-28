import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { writeGrantedToSession } from '@/features/preview-access';
import { markChangelogSeen } from '@/test/changelog';
import { renderAtRoute } from '@/test/render';

beforeEach(() => {
  markChangelogSeen();
});

afterEach(() => {
  window.sessionStorage.clear();
  window.localStorage.clear();
});

describe('gallery route', () => {
  it('renders the Galerie index with the Alben of the running Session', async () => {
    writeGrantedToSession(window.sessionStorage);
    renderAtRoute('/gallery');

    expect(await screen.findByRole('heading', { level: 1, name: 'GALERIE' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'DIESE SESSION' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Prunksitzung' })).toHaveAttribute(
      'href',
      '/gallery/prunksitzung-2026',
    );
  });

  it('features the newest Album once, without repeating it in the Session grid', async () => {
    writeGrantedToSession(window.sessionStorage);
    renderAtRoute('/gallery');

    expect(await screen.findByText('NEUESTES ALBUM')).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'Rosenmontagsumzug' })).toHaveLength(1);
    expect(screen.getByRole('link', { name: 'Rosenmontagsumzug' })).toHaveAttribute(
      'href',
      '/gallery/rosenmontagsumzug-2026',
    );
  });

  it('expands and collapses an older Session with the keyboard', async () => {
    const user = userEvent.setup();
    writeGrantedToSession(window.sessionStorage);
    renderAtRoute('/gallery');

    expect(
      await screen.findByRole('heading', { level: 2, name: 'FRÜHERE SESSIONEN' }),
    ).toBeInTheDocument();

    const toggle = screen.getByRole('button', { name: /2024\/25/ });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(
      screen.queryByRole('link', { name: /Prunksitzung 22\. Februar 2025/ }),
    ).not.toBeInTheDocument();

    toggle.focus();
    await user.keyboard('{Enter}');

    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(
      await screen.findByRole('link', { name: /Prunksitzung 22\. Februar 2025/ }),
    ).toHaveAttribute('href', '/gallery/prunksitzung-2025');

    await user.keyboard('{Enter}');

    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });
});
