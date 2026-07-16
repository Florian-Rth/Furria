import { kkTheme } from '@furria/ui';
import { ThemeProvider } from '@mui/material/styles';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { LandingPage } from './LandingPage';

const renderLandingPage = (): void => {
  render(
    <ThemeProvider theme={kkTheme}>
      <LandingPage />
    </ThemeProvider>,
  );
};

describe('LandingPage', () => {
  it('renders the FURRIA wordmark in the masthead', () => {
    renderLandingPage();

    expect(screen.getByText('FURRIA')).toBeInTheDocument();
  });

  it('renders the two-tone German teaser headline', () => {
    renderLandingPage();

    const headline = screen.getByRole('heading', { level: 1 });
    expect(headline).toHaveTextContent('DIE FÜNFTE JAHRESZEIT');
    expect(headline).toHaveTextContent('BEGINNT HIER.');
  });

  it('renders the pill call-to-action button', () => {
    renderLandingPage();

    expect(screen.getByRole('button', { name: 'Mitglied werden' })).toBeInTheDocument();
  });
});
