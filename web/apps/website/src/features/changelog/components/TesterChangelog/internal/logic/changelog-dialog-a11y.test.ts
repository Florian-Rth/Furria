import { describe, expect, it } from 'vitest';
import { buildPanelId, buildTabId, buildTriggerLabel } from './changelog-dialog-a11y';

describe('buildTabId / buildPanelId', () => {
  it('derives distinct ids from the same entry id', () => {
    expect(buildTabId('website-p4-news-fe')).toBe('changelog-tab-website-p4-news-fe');
    expect(buildPanelId('website-p4-news-fe')).toBe('changelog-panel-website-p4-news-fe');
  });
});

describe('buildTriggerLabel', () => {
  it('names the action alone when nothing is unread', () => {
    expect(buildTriggerLabel(0)).toBe('Änderungen anzeigen');
  });

  it('appends the unread count when entries are unread', () => {
    expect(buildTriggerLabel(3)).toBe('Änderungen anzeigen (3 neu)');
  });
});
