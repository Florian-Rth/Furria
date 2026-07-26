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

describe('home route', () => {
  it('shows the real landing inside the chrome when access is granted', async () => {
    writeGrantedToSession(window.sessionStorage);
    renderAtRoute('/');

    expect(
      await screen.findByRole('heading', { level: 1, name: 'GROSS FURRIA!' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Hauptnavigation' })).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });
});
