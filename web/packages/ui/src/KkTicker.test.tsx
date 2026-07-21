import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { KkThemeProvider } from './KkThemeProvider';
import { KkTicker } from './KkTicker';
import { kkTokens } from './tokens';

describe('KkTicker', () => {
  it('renders the content passed by the consumer', () => {
    render(
      <KkThemeProvider>
        <KkTicker content="GROSS FURRIA" />
      </KkThemeProvider>,
    );

    expect(screen.getAllByText('GROSS FURRIA').length).toBeGreaterThan(0);
  });

  it('duplicates the content track so the marquee loops with no gap', () => {
    render(
      <KkThemeProvider>
        <KkTicker content="GROSS FURRIA" />
      </KkThemeProvider>,
    );

    expect(screen.getAllByText('GROSS FURRIA')).toHaveLength(2);
  });

  it('hides the duplicated track segment from assistive tech so the copy is read once', () => {
    render(
      <KkThemeProvider>
        <KkTicker content="GROSS FURRIA" />
      </KkThemeProvider>,
    );

    const segments = screen.getAllByText('GROSS FURRIA');
    expect(segments[0]).not.toHaveAttribute('aria-hidden');
    expect(segments[1]).toHaveAttribute('aria-hidden', 'true');
  });

  it('paints a flat red bar from the primary token', () => {
    const { container } = render(
      <KkThemeProvider>
        <KkTicker content="GROSS FURRIA" />
      </KkThemeProvider>,
    );

    const bar = container.querySelector('[data-kk-ticker]');
    expect(bar).toHaveStyle({ backgroundColor: kkTokens.color.light.red, overflow: 'hidden' });
  });
});
