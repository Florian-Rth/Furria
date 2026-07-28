import { screen } from '@testing-library/react';
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
});
