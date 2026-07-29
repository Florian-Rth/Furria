import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  membershipTicketNumberLabel,
  membershipTicketObjections,
  membershipTicketRows,
  membershipTicketStamp,
} from '@/features/membership/ticket-content';
import { renderWithProviders } from '@/test/render';
import { MembershipTicketSection } from './MembershipTicketSection';

describe('MembershipTicketSection', () => {
  it('heads the section and stamps the ticket with the running Session', () => {
    renderWithProviders(<MembershipTicketSection />);

    expect(
      screen.getByRole('heading', { level: 2, name: 'ALLES AUF EINER KARTE.' }),
    ).toBeInTheDocument();
    expect(screen.getByText(membershipTicketStamp)).toBeInTheDocument();
  });

  it('prints every row of the flyer', () => {
    renderWithProviders(<MembershipTicketSection />);

    for (const row of membershipTicketRows) {
      expect(screen.getByText(row.label)).toBeInTheDocument();
      expect(screen.getByText(row.value)).toBeInTheDocument();
    }
    expect(document.querySelectorAll('[data-kk-membership-ticket-row]')).toHaveLength(
      membershipTicketRows.length,
    );
  });

  it('leaves the Mitglied number blank instead of inventing one', () => {
    renderWithProviders(<MembershipTicketSection />);

    const numberLine = screen.getByText(membershipTicketNumberLabel);

    expect(numberLine).toBeInTheDocument();
    expect(numberLine.parentElement?.textContent).toBe(membershipTicketNumberLabel);
  });

  it('answers the objections as chips', () => {
    renderWithProviders(<MembershipTicketSection />);

    for (const objection of membershipTicketObjections) {
      expect(screen.getByText(objection)).toBeInTheDocument();
    }
  });

  it('makes the stub the way into the Antrag', () => {
    renderWithProviders(<MembershipTicketSection />);

    expect(screen.getByRole('link', { name: 'Antrag stellen' })).toHaveAttribute(
      'href',
      '/join/apply',
    );
  });

  it('cuts a perforated edge without a barcode', () => {
    renderWithProviders(<MembershipTicketSection />);

    expect(document.querySelector('[data-kk-membership-ticket-perforation]')).not.toBeNull();
    expect(document.querySelector('[data-kk-membership-ticket]')).toHaveStyle({
      transform: 'rotate(-1.5deg)',
    });
  });
});
