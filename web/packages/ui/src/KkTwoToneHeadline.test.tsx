import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { KkThemeProvider } from './KkThemeProvider';
import { KkTwoToneHeadline } from './KkTwoToneHeadline';

const renderHeadline = (posterShadow?: boolean): void => {
  render(
    <KkThemeProvider>
      <KkTwoToneHeadline line1="GROSS" line2="FURRIA!" posterShadow={posterShadow} />
    </KkThemeProvider>,
  );
};

describe('KkTwoToneHeadline', () => {
  it('renders both lines inside a single level-1 heading', () => {
    renderHeadline();

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('GROSS');
    expect(heading).toHaveTextContent('FURRIA!');
  });

  it('omits the poster shadow by default', () => {
    renderHeadline();

    expect(screen.getByText('FURRIA!')).toHaveStyle({ textShadow: 'none' });
  });

  it('applies the hard poster shadow to the second line when enabled', () => {
    renderHeadline(true);

    expect(screen.getByText('FURRIA!')).not.toHaveStyle({ textShadow: 'none' });
  });
});
