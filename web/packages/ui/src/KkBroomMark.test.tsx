import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { KkBroomMark } from './KkBroomMark';
import { KkThemeProvider } from './KkThemeProvider';

describe('KkBroomMark', () => {
  it('renders a decorative svg sized to the given dimension', () => {
    const { container } = render(
      <KkThemeProvider>
        <KkBroomMark size={80} />
      </KkThemeProvider>,
    );

    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg).toHaveAttribute('width', '80');
    expect(svg).toHaveAttribute('height', '80');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });

  it('paints its geometry with currentColor so consumers control the colour', () => {
    const { container } = render(
      <KkThemeProvider>
        <KkBroomMark />
      </KkThemeProvider>,
    );

    expect(container.querySelector('svg')).toHaveStyle({ fill: 'currentColor' });
  });
});
