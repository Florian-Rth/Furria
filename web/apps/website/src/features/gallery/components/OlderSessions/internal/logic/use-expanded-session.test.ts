import { describe, expect, it } from 'vitest';
import {
  buildOlderSessionPanelId,
  buildOlderSessionToggleId,
  resolveCollapseTimeout,
  resolveExpandedSession,
} from './use-expanded-session';

describe('resolveExpandedSession', () => {
  it('opens a closed Session', () => {
    expect(resolveExpandedSession(null, 2024)).toBe(2024);
  });

  it('closes the Session that is already open', () => {
    expect(resolveExpandedSession(2024, 2024)).toBeNull();
  });

  it('moves the open Session instead of opening a second one', () => {
    expect(resolveExpandedSession(2024, 2023)).toBe(2023);
  });
});

describe('resolveCollapseTimeout', () => {
  it('collapses instantly when reduced motion is preferred', () => {
    expect(resolveCollapseTimeout(true)).toBe(0);
  });

  it('animates when motion is allowed', () => {
    expect(resolveCollapseTimeout(false)).toBeGreaterThan(0);
  });

  it('treats an unknown preference as motion-allowed', () => {
    expect(resolveCollapseTimeout(null)).toBeGreaterThan(0);
  });
});

describe('older Session element ids', () => {
  it('pairs a distinct toggle and panel id per Session', () => {
    expect(buildOlderSessionToggleId(2024)).toBe('older-session-2024-toggle');
    expect(buildOlderSessionPanelId(2024)).toBe('older-session-2024-panel');
    expect(buildOlderSessionPanelId(2024)).not.toBe(buildOlderSessionPanelId(2023));
  });
});
