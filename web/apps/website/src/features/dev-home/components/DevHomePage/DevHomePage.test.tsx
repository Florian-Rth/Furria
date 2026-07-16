import { kkTheme } from '@furria/ui';
import { ThemeProvider } from '@mui/material/styles';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DevHomePage } from './DevHomePage';

describe('DevHomePage', () => {
  it('renders the internal test area with all three apps', () => {
    render(
      <ThemeProvider theme={kkTheme}>
        <DevHomePage />
      </ThemeProvider>,
    );

    expect(screen.getByRole('heading', { name: 'Interner Testbereich' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Website' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Club-App' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Event-App' })).toBeInTheDocument();
  });
});
