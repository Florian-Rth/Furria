import { describe, expect, it } from 'vitest';
import { transferStatusOf, uploadFailureOfStatus } from './upload-failure';

describe('transferStatusOf', () => {
  it.each<[string, number | null, string | null, string]>([
    ['refused creation', 404, 'POST', 'gone'],
    ['expired transfer', 404, 'PATCH', 'interrupted'],
    ['expired resume check', 404, 'HEAD', 'interrupted'],
    ['unknown request', 404, null, 'interrupted'],
    ['too large creation', 413, 'POST', 'tooLarge'],
    ['transfer through an ended link', 410, 'PATCH', 'ended'],
    ['lost connection', null, null, 'interrupted'],
  ])('classifies a %s', (_, status, method, failure) => {
    expect(uploadFailureOfStatus(transferStatusOf(status, method))).toBe(failure);
  });
});
