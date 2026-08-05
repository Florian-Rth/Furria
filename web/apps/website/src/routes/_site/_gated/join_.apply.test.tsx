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

  it('ticks the Gruppen the Matcher handed over', async () => {
    renderAtRoute('/join/apply?groups=buettenrede,elferrat');

    expect(await screen.findByRole('checkbox', { name: 'Büttenrede' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Elferrat' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Tanzgarde' })).not.toBeChecked();
  });

  it('drops a Gruppe the roster does not know instead of showing the 404', async () => {
    renderAtRoute('/join/apply?groups=elferrat,showtanz,werkstatt');

    expect(await screen.findByRole('checkbox', { name: 'Elferrat' })).toBeChecked();
    expect(screen.getByRole('heading', { level: 1, name: applyTitle })).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'HIER WAR MAL EINE SEITE.' }),
    ).not.toBeInTheDocument();
  });

  it('renders the Antrag normally when the handover is malformed', async () => {
    renderAtRoute('/join/apply?groups=42&photo=[');

    expect(await screen.findByRole('checkbox', { name: 'Elferrat' })).not.toBeChecked();
    expect(screen.getByRole('heading', { level: 1, name: applyTitle })).toBeInTheDocument();
  });

  it('ticks no Gruppe when nobody handed anything over', async () => {
    renderAtRoute('/join/apply');

    expect(await screen.findByRole('checkbox', { name: 'Elferrat' })).not.toBeChecked();
  });

  it('keeps the Antrag behind the preview gate', async () => {
    window.sessionStorage.clear();
    renderAtRoute('/join/apply');

    expect(await screen.findByRole('button', { name: 'Einlass' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 1, name: applyTitle })).not.toBeInTheDocument();
  });
});
