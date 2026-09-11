import type { QueryErrorKind } from '@/lib/query-error';
import { toQueryErrorMessage } from '@/lib/query-error';

const PROFILE_ERROR_MESSAGES: Record<QueryErrorKind, string> = {
  unreachable:
    'Dein Profil hat den Server nicht erreicht. Prüfe deine Verbindung und versuch es noch einmal.',
  unexpected: 'Da ist etwas schiefgelaufen. Bitte versuch es gleich noch einmal.',
  rejected: 'Diese Änderung hat der Server nicht angenommen.',
};

export const toProfileErrorMessage = (error: Error | null): string | null =>
  toQueryErrorMessage(error, PROFILE_ERROR_MESSAGES);
