import { describe, expect, it } from 'vitest';
import { ApiError, RequestBlockedError } from '@/lib/api/errors';
import { toApplyErrorMessage } from './use-apply-form';

describe('toApplyErrorMessage', () => {
  it('stays quiet while nothing failed', () => {
    expect(toApplyErrorMessage(null)).toBeNull();
  });

  it('names the blocker when the request never left the browser', () => {
    expect(toApplyErrorMessage(new RequestBlockedError())).toContain('Werbeblocker');
  });

  it('admits a missing endpoint without blaming the applicant', () => {
    const message = toApplyErrorMessage(new ApiError(404));

    expect(message).toBe('Wir konnten den Antrag gerade nicht entgegennehmen.');
    expect(message?.toLowerCase()).not.toContain('fehler');
  });

  it('handles an unexpected failure the same honest way', () => {
    expect(toApplyErrorMessage(new Error('boom'))).toBe(
      'Wir konnten den Antrag gerade nicht entgegennehmen.',
    );
  });
});
