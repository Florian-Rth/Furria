import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { KkPhotoPlaceholder } from './KkPhotoPlaceholder';
import { KkThemeProvider } from './KkThemeProvider';

describe('KkPhotoPlaceholder', () => {
  it('shows the monospace label chip', () => {
    render(
      <KkThemeProvider>
        <KkPhotoPlaceholder label="garde-auf-der-buehne" />
      </KkThemeProvider>,
    );

    expect(screen.getByText('garde-auf-der-buehne')).toBeInTheDocument();
  });

  it('applies the requested aspect ratio to the surface', () => {
    render(
      <KkThemeProvider>
        <KkPhotoPlaceholder label="event-foto" aspectRatio="16 / 9" />
      </KkThemeProvider>,
    );

    expect(screen.getByText('event-foto').parentElement).toHaveStyle({ aspectRatio: '16 / 9' });
  });
});
