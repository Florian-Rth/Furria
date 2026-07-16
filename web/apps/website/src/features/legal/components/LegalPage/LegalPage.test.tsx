import { kkTheme } from '@furria/ui';
import { ThemeProvider } from '@mui/material/styles';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { LegalDocument } from '../../types';
import { LegalPage } from './LegalPage';

const legalDocument: LegalDocument = {
  title: 'Impressum',
  sections: [{ heading: 'Kontakt', paragraphs: ['E-Mail: test@example.org'] }],
};

describe('LegalPage', () => {
  it('renders the document title and its sections', () => {
    render(
      <ThemeProvider theme={kkTheme}>
        <LegalPage legalDocument={legalDocument} />
      </ThemeProvider>,
    );

    expect(screen.getByRole('heading', { level: 1, name: 'Impressum' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Kontakt' })).toBeInTheDocument();
    expect(screen.getByText('E-Mail: test@example.org')).toBeInTheDocument();
  });
});
