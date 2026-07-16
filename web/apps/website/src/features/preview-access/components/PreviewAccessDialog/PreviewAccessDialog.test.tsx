import { kkTheme } from '@furria/ui';
import { ThemeProvider } from '@mui/material/styles';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PreviewAccessProvider } from '../PreviewAccessProvider';
import { PreviewAccessDialog } from './PreviewAccessDialog';

const renderDialog = (onClose: () => void = () => {}): void => {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });

  render(
    <ThemeProvider theme={kkTheme}>
      <QueryClientProvider client={queryClient}>
        <PreviewAccessProvider>
          <PreviewAccessDialog open onClose={onClose} />
        </PreviewAccessProvider>
      </QueryClientProvider>
    </ThemeProvider>,
  );
};

const stubUnlockEndpoint = (status: number, body: unknown): void => {
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

  it('closes the dialog and persists access when the password is accepted', async () => {
    stubUnlockEndpoint(200, { granted: true });
    const onClose = vi.fn();
    const user = userEvent.setup();
    renderDialog(onClose);

    await user.type(screen.getByLabelText('Passwort'), 'correct');
    await user.click(screen.getByRole('button', { name: 'Einlass' }));

    expect(await screen.findByText('Einlass')).toBeInTheDocument();
    await vi.waitFor(() => {
      expect(onClose).toHaveBeenCalledTimes(1);
    });
    expect(window.sessionStorage.getItem('furria.preview.granted')).toBe('granted');
  });
});
