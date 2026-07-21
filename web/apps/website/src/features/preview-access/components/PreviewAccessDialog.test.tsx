import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '@/test/render';
import { readGrantedFromSession } from '../session-storage';
import { PreviewAccessDialog } from './PreviewAccessDialog';

const renderDialog = (): void => {
  renderWithProviders(<PreviewAccessDialog open onClose={() => {}} />);
};

const stubUnlockEndpoint = (status: number, body: { granted?: boolean }): void => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => new Response(JSON.stringify(body), { status })),
  );
};

afterEach(() => {
  vi.unstubAllGlobals();
  window.sessionStorage.clear();
});

describe('PreviewAccessDialog', () => {
  it('shows a validation message when submitting an empty password', async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.click(screen.getByRole('button', { name: 'Einlass' }));

    expect(await screen.findByText('Bitte gib das Passwort ein.')).toBeInTheDocument();
  });

  it('shows a German error when the API rejects the password', async () => {
    stubUnlockEndpoint(401, {});
    const user = userEvent.setup();
    renderDialog();

    await user.type(screen.getByLabelText('Passwort'), 'wrong');
    await user.click(screen.getByRole('button', { name: 'Einlass' }));

    expect(
      await screen.findByText('Falsches Passwort. Bitte versuch es noch einmal.'),
    ).toBeInTheDocument();
  });

  it('persists access when the password is accepted', async () => {
    stubUnlockEndpoint(200, { granted: true });
    const user = userEvent.setup();
    renderDialog();

    await user.type(screen.getByLabelText('Passwort'), 'correct');
    await user.click(screen.getByRole('button', { name: 'Einlass' }));

    await vi.waitFor(() => {
      expect(readGrantedFromSession(window.sessionStorage)).toBe(true);
    });
  });
});
