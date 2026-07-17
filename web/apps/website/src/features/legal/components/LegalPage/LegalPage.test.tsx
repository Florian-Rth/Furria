import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '@/test/render';
import type { LegalDocument } from '../../types';
import { LegalPage } from './LegalPage';

const legalDocument: LegalDocument = {
  title: 'Impressum',
  sections: [{ heading: 'Kontakt', paragraphs: ['E-Mail: test@example.org'] }],
};

describe('LegalPage', () => {
  it('renders the document title and its sections', () => {
    renderWithProviders(<LegalPage legalDocument={legalDocument} />);

    expect(screen.getByRole('heading', { level: 1, name: 'Impressum' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Kontakt' })).toBeInTheDocument();
    expect(screen.getByText('E-Mail: test@example.org')).toBeInTheDocument();
  });
});
