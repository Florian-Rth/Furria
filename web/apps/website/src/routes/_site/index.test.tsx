import { screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { writeGrantedToSession } from '@/features/preview-access';
import { renderAtRoute } from '@/test/render';

afterEach(() => {
  window.sessionStorage.clear();
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
