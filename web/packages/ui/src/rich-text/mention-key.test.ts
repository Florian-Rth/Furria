import { describe, expect, it } from 'vitest';
import type { MentionTarget } from './mention-key';
import { mentionTargetOf } from './mention-key';
import { MENTION_KINDS } from './rich-text-model';

describe('mentionTargetOf', () => {
  it.each<[string, MentionTarget | null]>([
    ['group:12', { kind: 'group', id: 12 }],
    ['person:7', { kind: 'person', id: 7 }],
    ['calendar-entry:3', { kind: 'calendar-entry', id: 3 }],
    ['event:4', { kind: 'event', id: 4 }],
    ['news-post:5', { kind: 'news-post', id: 5 }],
    ['album:6', { kind: 'album', id: 6 }],
    ['club:1', null],
    ['Group:1', null],
    ['group:0', null],
    ['group:-1', null],
    ['group:1.5', null],
    ['group:99999999999999999999', null],
    ['group:', null],
    ['group:1 ', null],
    ['', null],
  ])('reads %j', (key, expected) => {
    expect(mentionTargetOf(key, MENTION_KINDS)).toEqual(expected);
  });
});

describe('mentionTargetOf for a host', () => {
  it.each<[string, MentionTarget | null]>([
    ['group:12', { kind: 'group', id: 12 }],
    ['person:7', { kind: 'person', id: 7 }],
    ['event:4', null],
    ['album:6', null],
  ])('reads %j for group and person only', (key, expected) => {
    expect(mentionTargetOf(key, ['group', 'person'])).toEqual(expected);
  });
});
