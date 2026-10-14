import { isNotFoundError, toQueryErrorKind } from '@/lib/query-error';
import { toWriteErrorMessage } from '@/lib/write-error';
import { UNSAVED_FAILED } from './editor-copy';
import { SaveFailedError } from './news-draft-session';

export const newsFailureMessageOf = (error: Error, unexpected: string): string | null => {
  if (error instanceof SaveFailedError) {
    return UNSAVED_FAILED;
  }
  if (toQueryErrorKind(error) === 'unexpected' && !isNotFoundError(error)) {
    return unexpected;
  }
  return toWriteErrorMessage(error);
};
