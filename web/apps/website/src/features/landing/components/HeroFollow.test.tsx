import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '@/test/render';
import { HeroFollow } from './HeroFollow';

describe('HeroFollow', () => {
  it('renders its children', () => {
    renderWithProviders(
      <HeroFollow>
        <p>Follow content</p>
      </HeroFollow>,
    );

    expect(screen.getByText('Follow content')).toBeInTheDocument();
  });
});
