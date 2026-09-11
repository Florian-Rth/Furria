import type { QueryErrorKind } from '@/lib/query-error';
import { toQueryErrorMessage } from '@/lib/query-error';

const MEMBERS_ERROR_MESSAGES: Record<QueryErrorKind, string> = {
  unreachable:
    'Die Mitgliederliste hat den Server nicht erreicht. Prüfe deine Verbindung und versuch es noch einmal.',
  unexpected: 'Da ist etwas schiefgelaufen. Bitte versuch es gleich noch einmal.',
  rejected: 'Der Server hat diese Anfrage nicht angenommen.',
};

export const toMembersErrorMessage = (error: Error | null): string | null =>
  toQueryErrorMessage(error, MEMBERS_ERROR_MESSAGES);
