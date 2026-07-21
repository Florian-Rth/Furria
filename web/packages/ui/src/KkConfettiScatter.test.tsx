import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { KkConfettiScatter } from './KkConfettiScatter';
import { KkThemeProvider } from './KkThemeProvider';

describe('KkConfettiScatter', () => {
  it('scatters one chip per requested piece', () => {
    const { container } = render(
      <KkThemeProvider>
        <KkConfettiScatter count={5} seed={12} />
      </KkThemeProvider>,
    );

    const box = container.querySelector('[data-kk-confetti-scatter]');
    expect(box?.childElementCount).toBe(5);
  });

  it('is a non-interactive decoration hidden from assistive tech', () => {
    const { container } = render(
      <KkThemeProvider>
        <KkConfettiScatter count={3} seed={1} />
      </KkThemeProvider>,
    );

    const box = container.querySelector('[data-kk-confetti-scatter]');
    expect(box).toHaveAttribute('aria-hidden', 'true');
    expect(box).toHaveStyle({ position: 'absolute', pointerEvents: 'none' });
  });
});
