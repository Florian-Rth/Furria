import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '@/test/render';
import { DevHomePage } from './DevHomePage';

describe('DevHomePage', () => {
  it('renders the internal test area with all three apps', () => {
    renderWithProviders(<DevHomePage />);

    expect(screen.getByRole('heading', { name: 'Interner Testbereich' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Website' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Club-App' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Event-App' })).toBeInTheDocument();
  });
});
