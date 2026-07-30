import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  APPLY_THANKS_STEPS,
  applyThanksEyebrow,
  applyThanksHomeLabel,
  applyThanksProgramLabel,
} from '@/features/membership/apply-content';
import { renderWithProviders } from '@/test/render';
import { ApplyConfirmation } from './ApplyConfirmation';

describe('ApplyConfirmation', () => {
  it('thanks the applicant by first name', () => {
    renderWithProviders(<ApplyConfirmation firstName="Lena" />);

    expect(screen.getByRole('heading', { level: 1, name: 'DANKE, Lena.' })).toBeInTheDocument();
    expect(screen.getByText(applyThanksEyebrow)).toBeInTheDocument();
  });

  it('never welcomes the applicant as a Mitglied', () => {
    renderWithProviders(<ApplyConfirmation firstName="Lena" />);

    expect(
      screen.queryByRole('heading', { level: 1, name: /WILLKOMMEN/i }),
    ).not.toBeInTheDocument();
    expect(screen.getByText(/noch kein Mitglied/)).toBeInTheDocument();
  });

  it('names the three next steps in the order they happen', () => {
    renderWithProviders(<ApplyConfirmation firstName="Lena" />);

    const titles = APPLY_THANKS_STEPS.map((step) => step.title);
    const rendered = screen.getAllByText(new RegExp(`^(${titles.join('|')})$`));

    expect(rendered.map((element) => element.textContent)).toEqual(titles);
    expect(screen.getByText('01')).toBeInTheDocument();
    expect(screen.getByText('03')).toBeInTheDocument();
  });

  it('never names a Vorstand and never invents a date for the Sitzung', () => {
    renderWithProviders(<ApplyConfirmation firstName="Lena" />);

    const copy = document.body.textContent ?? '';

    expect(copy.toLowerCase()).not.toContain('vorstand');
    expect(copy).not.toMatch(/\d{1,2}\.\d{1,2}\./);
  });

  it('stamps the confirmation with exactly one seal', () => {
    renderWithProviders(<ApplyConfirmation firstName="Lena" />);

    expect(document.querySelectorAll('[data-kk-seal]')).toHaveLength(1);
  });

  it('leads out to the Programm and to the Startseite', () => {
    renderWithProviders(<ApplyConfirmation firstName="Lena" />);

    expect(screen.getByRole('link', { name: applyThanksProgramLabel })).toHaveAttribute(
      'href',
      '/program',
    );
    expect(screen.getByRole('link', { name: applyThanksHomeLabel })).toHaveAttribute('href', '/');
  });
});
