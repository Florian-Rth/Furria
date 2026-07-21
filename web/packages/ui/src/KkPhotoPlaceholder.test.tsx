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

  it('fills its parent without an aspect ratio when fill is set', () => {
    render(
      <KkThemeProvider>
        <KkPhotoPlaceholder label="hero-foto" fill />
      </KkThemeProvider>,
    );

    const surface = screen.getByText('hero-foto').parentElement;
    expect(surface).not.toHaveStyle({ aspectRatio: '4 / 5' });
    expect(surface).toHaveStyle({ height: '100%' });
  });
});
