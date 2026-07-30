import { screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { applyFieldLabels, applyTitle } from '@/features/membership/apply-content';
import { joinPageTitle } from '@/features/membership/join-content';
import { writeGrantedToSession } from '@/features/preview-access';
import { markChangelogSeen } from '@/test/changelog';
import { renderAtRoute } from '@/test/render';

beforeEach(() => {
  markChangelogSeen();
  writeGrantedToSession(window.sessionStorage);
});

afterEach(() => {
  window.sessionStorage.clear();
  window.localStorage.clear();
});

describe('join apply route', () => {
  it('stands on its own instead of rendering inside the info page', async () => {
    renderAtRoute('/join/apply');

    expect(await screen.findByRole('heading', { level: 1, name: applyTitle })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: joinPageTitle })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'WO PASSE ICH HIN?' })).not.toBeInTheDocument();
  });

  it('carries the Antrag form and a way back to the info page', async () => {
    renderAtRoute('/join/apply');

    expect(
      await screen.findByLabelText(new RegExp(`^${applyFieldLabels.firstName}`)),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '← Mitglied werden' })).toHaveAttribute(
      'href',
      '/join',
    );
  });

  it('keeps the Antrag behind the preview gate', async () => {
    window.sessionStorage.clear();
    renderAtRoute('/join/apply');

    expect(await screen.findByRole('button', { name: 'Einlass' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 1, name: applyTitle })).not.toBeInTheDocument();
  });
});
