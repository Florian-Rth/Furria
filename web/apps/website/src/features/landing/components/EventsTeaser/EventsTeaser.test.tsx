import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithRouter } from '@/test/render';
import { EventsTeaser } from './EventsTeaser';

describe('EventsTeaser', () => {
  it('renders the three earliest seeded evenings as card and row', async () => {
    renderWithRouter(<EventsTeaser />);

    expect(await screen.findAllByText('1. Prunksitzung')).toHaveLength(2);
    expect(screen.getAllByText('2. Prunksitzung')).toHaveLength(2);
    expect(screen.getAllByText('Weiberfasching')).toHaveLength(2);
  });
});
