import { screen } from '@testing-library/react';

export const labelPattern = (label: string): RegExp => new RegExp(`^${label}( \\*)?$`);

export const fieldByLabel = (label: string): HTMLElement =>
  screen.getByLabelText(labelPattern(label));
