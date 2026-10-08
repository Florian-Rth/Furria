import { describe, expect, it } from 'vitest';
import { buildTicketRequestPayload } from './ticket-request-payload';

describe('buildTicketRequestPayload', () => {
  it.each([
    ['', null],
    ['Wir sitzen gern zusammen.', 'Wir sitzen gern zusammen.'],
  ])('sends the message %j as %j', (message, sent) => {
    const payload = buildTicketRequestPayload(
      12,
      {
        ticketCount: 4,
        name: 'Lena Brandt',
        phone: '0170 1234567',
        email: 'lena@example.de',
        message,
        consent: true,
        honeypot: '',
      },
      'eyJ9',
    );

    expect(payload.message).toBe(sent);
  });
});
