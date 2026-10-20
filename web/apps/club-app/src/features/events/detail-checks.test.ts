import { describe, expect, it } from 'vitest';
import { checkOf, checksOf, PUBLISH_CHECKS } from './detail-checks';
import type { EventDetails } from './schemas';

type Checked = Parameters<typeof checkOf>[0];

const event = (overrides: Partial<Checked> = {}): Checked => ({
  venueName: 'Bürgerhaus',
  doorsOpenAt: '18:30',
  teaser: 'Der Abend',
  description: 'Lang',
  picture: null,
  ageHint: null,
  status: 'available',
  steps: [{ step: 'details', state: 'open', dueOn: '2026-10-30', opensOn: null }],
  ...overrides,
});

describe('checkOf', () => {
  it('passes a set fact without a fix', () => {
    expect(checkOf(event(), 'venue')).toEqual({ key: 'venue', state: 'done', fix: null });
  });

  it('sends a missing picture to the picture desk', () => {
    expect(checkOf(event(), 'picture')).toEqual({ key: 'picture', state: 'open', fix: 'picture' });
  });

  it('turns a missing fact gold when Eckdaten are overdue', () => {
    const late = event({
      doorsOpenAt: null,
      steps: [{ step: 'details', state: 'overdue', dueOn: '2026-10-01', opensOn: null }],
    });

    expect(checkOf(late, 'doors')).toEqual({ key: 'doors', state: 'overdue', fix: 'edit' });
  });

  it('never flags the optional age hint', () => {
    expect(checkOf(event(), 'ageHint').state).toBe('off');
  });

  it('treats a blank description as missing', () => {
    expect(checkOf(event({ description: '  ' }), 'description').state).toBe('open');
  });
});

describe('checksOf', () => {
  it('lists the publish criteria in order', () => {
    const picture: EventDetails['picture'] = null;

    expect(checksOf(event({ picture }), PUBLISH_CHECKS).map((check) => check.state)).toEqual([
      'done',
      'done',
      'done',
      'open',
    ]);
  });
});
