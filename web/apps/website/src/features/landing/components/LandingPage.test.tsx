import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '@/test/render';
import { LandingPage } from './LandingPage';

describe('LandingPage', () => {
  it('renders the GROSS FURRIA! poster headline as the page h1', () => {
    renderWithProviders(<LandingPage />);

    expect(screen.getByRole('heading', { level: 1, name: 'GROSS FURRIA!' })).toBeInTheDocument();
  });

  it('introduces the club with a short German intro paragraph', () => {
    renderWithProviders(<LandingPage />);

    expect(screen.getByText(/Großbesenstadt/)).toBeInTheDocument();
  });
});
