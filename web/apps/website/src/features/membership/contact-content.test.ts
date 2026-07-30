import { describe, expect, it } from 'vitest';
import { CLUB_CONTACT_EMAIL } from '@/lib/club';
import {
  joinContactHref,
  joinContactLabel,
  joinContactNote,
  joinContactText,
  joinContactTitle,
} from './contact-content';

const allContactCopy = [joinContactTitle, joinContactText, joinContactNote, joinContactLabel].join(
  ' ',
);

describe('the Kontakt copy', () => {
  it('offers exactly one channel, the club address', () => {
    expect(joinContactHref).toBe(`mailto:${CLUB_CONTACT_EMAIL}`);
    expect(joinContactLabel).toBe(CLUB_CONTACT_EMAIL);
  });

  it('says an answer comes from a person and costs no Antrag', () => {
    expect(joinContactText).toContain('Mensch');
    expect(joinContactText).toContain('Antrag');
  });

  it('never publishes a phone number', () => {
    expect(allContactCopy).not.toMatch(/\d{3,}/);
  });

  it('never names a person or an Amt', () => {
    expect(allContactCopy.toLowerCase()).not.toContain('präsident');
    expect(allContactCopy.toLowerCase()).not.toContain('vorstand');
    expect(allContactCopy.toLowerCase()).not.toContain('trainer');
  });
});
