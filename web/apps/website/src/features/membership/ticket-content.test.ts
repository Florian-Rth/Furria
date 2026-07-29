import { describe, expect, it } from 'vitest';
import {
  buildMembershipTicketStamp,
  membershipTicketIntro,
  membershipTicketLead,
  membershipTicketObjections,
  membershipTicketRows,
} from './ticket-content';

const rowByLabel = (label: string): string =>
  membershipTicketRows.find((row) => row.label === label)?.value ?? '';

const allTicketCopy = [
  membershipTicketIntro,
  membershipTicketLead,
  ...membershipTicketObjections,
  ...membershipTicketRows.flatMap((row) => [row.label, row.value]),
].join(' ');

describe('buildMembershipTicketStamp', () => {
  it('stamps the ticket with the running Session', () => {
    expect(buildMembershipTicketStamp('2026/27')).toBe('MITGLIEDSCHAFT · SESSION 2026/27');
  });

  it('tracks whichever Session it is given', () => {
    expect(buildMembershipTicketStamp('2027/28')).toBe('MITGLIEDSCHAFT · SESSION 2027/28');
  });
});

describe('membershipTicketRows', () => {
  it('answers the seven questions in the order someone deciding asks them', () => {
    expect(membershipTicketRows.map((row) => row.label)).toEqual([
      'BEITRAG',
      'LAUFZEIT',
      'PAUSE',
      'GRUPPEN',
      'DRIN',
      'ERWARTET',
      'FRAGEN',
    ]);
  });

  it('names both Beitrag tiers and rules out an Aufnahmegebühr', () => {
    const beitrag = rowByLabel('BEITRAG');

    expect(beitrag).toContain('30 €');
    expect(beitrag).toContain('15 €');
    expect(beitrag).toContain('keine Aufnahmegebühr');
  });

  it('ties the Laufzeit to the Session', () => {
    expect(rowByLabel('LAUFZEIT')).toContain('Session');
  });

  it('says the Mitgliedschaft ruht instead of ending', () => {
    expect(rowByLabel('PAUSE')).toContain('ruht');
  });

  it('leaves the number of Gruppen open, including none', () => {
    expect(rowByLabel('GRUPPEN')).toContain('keine');
  });

  it('keeps every row filled in', () => {
    for (const row of membershipTicketRows) {
      expect(row.value.length).toBeGreaterThan(0);
    }
  });
});

describe('membershipTicketObjections', () => {
  it('answers the three objections that keep people out', () => {
    expect(membershipTicketObjections).toEqual([
      'Keine Aufnahmegebühr',
      'Kein Vorsingen',
      'Wohnort egal',
    ]);
  });
});

describe('the ticket copy', () => {
  it('never calls a paused Mitgliedschaft passiv', () => {
    expect(allTicketCopy.toLowerCase()).not.toContain('passiv');
  });

  it('never names a Vorstand', () => {
    expect(allTicketCopy.toLowerCase()).not.toContain('vorstand');
  });

  it('never promises Kostüme', () => {
    expect(allTicketCopy.toLowerCase()).not.toContain('kostüm');
  });

  it('never sells the ticket as a purchase or a trial', () => {
    expect(allTicketCopy.toLowerCase()).not.toContain('probeticket');
    expect(allTicketCopy.toLowerCase()).not.toContain('eintrittskarte');
  });
});
