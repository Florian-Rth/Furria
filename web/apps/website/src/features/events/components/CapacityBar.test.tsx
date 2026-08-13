import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '@/test/render';
import { CapacityBar } from './CapacityBar';

describe('CapacityBar', () => {
  it('fills with the share of seats already taken', () => {
    renderWithProviders(<CapacityBar freeCount={65} capacity={260} color="success" />);

    expect(screen.getByRole('progressbar', { name: 'Vergebene Plätze' })).toHaveAttribute(
      'aria-valuenow',
      '75',
    );
  });

  it('stays empty while every seat is free', () => {
    renderWithProviders(<CapacityBar freeCount={200} capacity={200} color="success" />);

    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
  });
});
