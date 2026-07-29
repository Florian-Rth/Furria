import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '../test/render';
import { KkStatRow } from './KkStatRow';

describe('KkStatRow', () => {
  it('renders every stat as a value with its label', () => {
    renderWithProviders(
      <KkStatRow>
        <KkStatRow.Item>
          <KkStatRow.Value variant="h3">1954</KkStatRow.Value>
          <KkStatRow.Label>gegründet</KkStatRow.Label>
        </KkStatRow.Item>
        <KkStatRow.Item>
          <KkStatRow.Value variant="h3">7</KkStatRow.Value>
          <KkStatRow.Label>Gruppen</KkStatRow.Label>
        </KkStatRow.Item>
      </KkStatRow>,
    );

    expect(screen.getByText('1954')).toBeInTheDocument();
    expect(screen.getByText('gegründet')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText('Gruppen')).toBeInTheDocument();
  });

  it('takes its type scale from the call site instead of a size prop', () => {
    renderWithProviders(
      <KkStatRow>
        <KkStatRow.Item>
          <KkStatRow.Value variant="h4">120</KkStatRow.Value>
          <KkStatRow.Label>Mitglieder</KkStatRow.Label>
        </KkStatRow.Item>
      </KkStatRow>,
    );

    expect(screen.getByText('120')).toHaveClass('MuiTypography-h4');
    expect(screen.getByText('Mitglieder')).toHaveClass('MuiTypography-caption');
  });

  it('exposes the row through its dev hook and lets the call site restyle it', () => {
    const { container } = renderWithProviders(
      <KkStatRow sx={{ gap: 4 }}>
        <KkStatRow.Item>
          <KkStatRow.Value variant="h4">3.</KkStatRow.Value>
          <KkStatRow.Label>Session</KkStatRow.Label>
        </KkStatRow.Item>
      </KkStatRow>,
    );

    const row = container.querySelector('[data-kk-stat-row]');

    expect(row).not.toBeNull();
    expect(row).toHaveStyle({ flexWrap: 'wrap' });
  });
});
