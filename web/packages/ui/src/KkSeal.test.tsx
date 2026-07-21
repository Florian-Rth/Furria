import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { KkSeal } from './KkSeal';
import { KkThemeProvider } from './KkThemeProvider';

describe('KkSeal', () => {
  it('renders the given date label and caption', () => {
    render(
      <KkThemeProvider>
        <KkSeal dateLabel="11.11" caption="ERÖFFNUNG" />
      </KkThemeProvider>,
    );

    expect(screen.getByText('11.11')).toBeInTheDocument();
    expect(screen.getByText('ERÖFFNUNG')).toBeInTheDocument();
  });

  it('applies the requested rotation to the disc', () => {
    render(
      <KkThemeProvider>
        <KkSeal dateLabel="11.11" caption="ERÖFFNUNG" rotation={-6} />
      </KkThemeProvider>,
    );

    expect(screen.getByText('11.11').closest('[data-kk-seal]')).toHaveStyle({
      transform: 'rotate(-6deg)',
    });
  });
});
