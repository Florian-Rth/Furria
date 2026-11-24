import { describe, expect, it } from 'vitest';
import { shareUrlOf } from './upload-link-view';

const TOKEN = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJK_-0123';

describe('shareUrlOf', () => {
  it('keeps the token in the fragment so no server sees it', () => {
    expect(shareUrlOf('https://app.example.org', TOKEN)).toBe(
      `https://app.example.org/photos#${TOKEN}`,
    );
  });
});
