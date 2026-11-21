import { describe, expect, it } from 'vitest';
import { toChosenLabels, toSenderName, toVoterEntry } from './whatsapp-answers';

describe('toChosenLabels', () => {
  it.each([
    { optionIds: [13, 11], expected: ['10 Uhr', '18 Uhr'] },
    { optionIds: [12], expected: ['14 Uhr'] },
    { optionIds: [99], expected: [] },
  ])('names the options $optionIds in ballot order', ({ optionIds, expected }) => {
    const options = [
      { optionId: 11, label: '10 Uhr' },
      { optionId: 12, label: '14 Uhr' },
      { optionId: 13, label: '18 Uhr' },
    ];

    expect(toChosenLabels(optionIds, options)).toEqual(expected);
  });
});

describe('toSenderName', () => {
  it.each([
    { whatsAppName: 'Heinz', phone: '+491609999999', expected: 'Heinz' },
    { whatsAppName: null, phone: '+491609999999', expected: '+491609999999' },
    { whatsAppName: null, phone: null, expected: 'unknown' },
  ])('names $expected', ({ whatsAppName, phone, expected }) => {
    expect(toSenderName({ whatsAppName, phone }, 'unknown')).toEqual(expected);
  });
});

describe('toVoterEntry', () => {
  it.each([
    { isGivenThroughWhatsApp: true, note: 'wa' },
    { isGivenThroughWhatsApp: false, note: undefined },
  ])(
    'notes WhatsApp when given through it: $isGivenThroughWhatsApp',
    ({ isGivenThroughWhatsApp, note }) => {
      const voter = { personId: 4, firstName: 'Alice', lastName: 'Muster', isGivenThroughWhatsApp };

      expect(toVoterEntry(voter, null, 'wa').note).toEqual(note);
    },
  );
});
