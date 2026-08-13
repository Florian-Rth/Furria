import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '@/test/render';
import { EventDateBlock } from './EventDateBlock';

describe('EventDateBlock', () => {
  it('shows the padded day and the German month abbreviation', () => {
    renderWithProviders(<EventDateBlock startsAt="2027-02-04T18:30" tint="#E11D2A" />);

    expect(screen.getByText('04')).toBeInTheDocument();
    expect(screen.getByText('FEB')).toBeInTheDocument();
  });
});
