import { describe, expect, it } from 'vitest';
import { WrongPasswordError } from '../api';
import { toSubmitErrorMessage } from './use-unlock-form';

describe('toSubmitErrorMessage', () => {
  it('returns null while no error occurred', () => {
    expect(toSubmitErrorMessage(null)).toBeNull();
  });

  it('maps a rejected password to a German error message', () => {
    expect(toSubmitErrorMessage(new WrongPasswordError())).toBe(
      'Falsches Passwort. Bitte versuch es noch einmal.',
    );
  });

  it('maps unexpected failures to a generic German error message', () => {
    expect(toSubmitErrorMessage(new Error('boom'))).toBe(
      'Das hat leider nicht geklappt. Bitte versuch es später noch einmal.',
    );
  });
});
