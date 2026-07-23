import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '@/test/render';
import { ChapterHeader } from './ChapterHeader';

describe('ChapterHeader', () => {
  it('renders the chapter title as a section-level heading', () => {
    renderWithProviders(
      <ChapterHeader numeral="01" kicker="WER WIR SIND" title="EIN VEREIN MIT HERZ" />,
    );

    expect(
      screen.getByRole('heading', { level: 2, name: 'EIN VEREIN MIT HERZ' }),
    ).toBeInTheDocument();
  });

  it('shows the tracked kicker eyebrow', () => {
    renderWithProviders(<ChapterHeader numeral="02" kicker="DIE CHRONIK" title="TITEL" />);

    expect(screen.getByText('DIE CHRONIK')).toBeInTheDocument();
  });

  it('shows the giant chapter numeral', () => {
    renderWithProviders(<ChapterHeader numeral="03" kicker="EINE SESSION" title="TITEL" />);

    expect(screen.getByText('03')).toBeInTheDocument();
  });
});
