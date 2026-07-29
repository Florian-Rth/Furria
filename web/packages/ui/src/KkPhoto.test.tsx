import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { KkPhoto } from './KkPhoto';
import { renderWithProviders } from './test/render';

describe('KkPhoto', () => {
  it('falls back to the placeholder while there is no source', () => {
    renderWithProviders(
      <KkPhoto
        alt="Die Garde auf der Bühne"
        orientation="landscape"
        placeholderLabel="foto-folgt"
      />,
    );

    expect(screen.getByText('foto-folgt')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('renders a lazily loaded image carrying the alt text once a source is set', () => {
    renderWithProviders(
      <KkPhoto
        alt="Die Garde auf der Bühne"
        orientation="landscape"
        placeholderLabel="foto-folgt"
        source="/fotos/garde.jpg"
      />,
    );

    const image = screen.getByRole('img', { name: 'Die Garde auf der Bühne' });

    expect(image).toHaveAttribute('src', '/fotos/garde.jpg');
    expect(image).toHaveAttribute('loading', 'lazy');
    expect(image).toHaveAttribute('decoding', 'async');
    expect(image).toHaveAttribute('width');
    expect(image).toHaveAttribute('height');
  });
});
