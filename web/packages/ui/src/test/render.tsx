import type { RenderResult } from '@testing-library/react';
import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { KkThemeProvider } from '../KkThemeProvider';

export const renderWithProviders = (ui: ReactElement): RenderResult =>
  render(<KkThemeProvider>{ui}</KkThemeProvider>);
