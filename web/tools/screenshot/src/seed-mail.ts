import type { MailSummary } from './seed-schemas.ts';

const CLOCK_SKEW_MS = 2_000;
const INVITATION_TOKEN = /\/invitation#token=([A-Za-z0-9_-]+)/;

export const mailSentSince = (
  messages: readonly MailSummary[],
  sentAfter: Date,
): MailSummary | null =>
  messages.find((message) => Date.parse(message.Created) >= sentAfter.getTime() - CLOCK_SKEW_MS) ??
  null;

export const invitationTokenOf = (text: string): string | null =>
  INVITATION_TOKEN.exec(text)?.[1] ?? null;
