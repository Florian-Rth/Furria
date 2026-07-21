import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '@/test/render';
import { PlaceholderPage } from './PlaceholderPage';

describe('PlaceholderPage', () => {
  it('renders the page title and the under-construction copy', () => {
    renderWithProviders(<PlaceholderPage title="Programm" />);

    expect(screen.getByRole('heading', { level: 1, name: 'Programm' })).toBeInTheDocument();
    expect(screen.getByText('Diese Seite entsteht gerade.')).toBeInTheDocument();
  });
});
