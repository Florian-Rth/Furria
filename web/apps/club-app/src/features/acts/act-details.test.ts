import { describe, expect, it } from 'vitest';
import type { ActDetailsAccess, ActDetailsPane } from './act-details';
import { actDetailsAccessOf, actDetailsPaneOf, actDetailsPathOf } from './act-details';
import type { ActViewer } from './schemas';

describe('actDetailsPaneOf', () => {
  it.each([
    ['/_app/acts_/$actId_/details/settings', {}, { kind: 'settings' }],
    [
      '/_app/acts_/$actId_/details/evenings/$eventId',
      { eventId: '8' },
      { kind: 'evening', eventId: 8 },
    ],
    ['/_app/acts_/$actId_/details/evenings/$eventId', { eventId: 'x' }, null],
    [
      '/_app/acts_/$actId_/details/trainings/$trainingId/roll',
      { trainingId: '31' },
      { kind: 'roll', trainingId: 31 },
    ],
    ['/_app/acts_/$actId_/details/trainings/$trainingId/roll', { trainingId: '0' }, null],
    ['/_app/acts_/$actId_/details/', {}, null],
  ])('%s %j → %j', (routeId, params, expected) => {
    expect(actDetailsPaneOf({ routeId, params })).toEqual(expected);
  });

  it('has no pane without a child match', () => {
    expect(actDetailsPaneOf(undefined)).toBeNull();
  });
});

describe('actDetailsPathOf', () => {
  it.each<[ActDetailsPane | null, string]>([
    [null, '/acts/5/details'],
    [{ kind: 'settings' }, '/acts/5/details/settings'],
    [{ kind: 'evening', eventId: 8 }, '/acts/5/details/evenings/8'],
    [{ kind: 'roll', trainingId: 31 }, '/acts/5/details/trainings/31/roll'],
  ])('%j → %s', (pane, expected) => {
    expect(actDetailsPathOf(5, pane)).toBe(expected);
  });
});

describe('actDetailsAccessOf', () => {
  const viewer = (
    canEditStudio: boolean,
    canEditSettings: boolean,
    canMarkAttendance: boolean,
  ): ActViewer => ({
    inCast: true,
    canEditStudio,
    canEditSettings,
    canGrantCoEditors: false,
    canMarkAttendance,
  });
  const studio = { evenings: [{ eventId: 8 }], trainings: [{ calendarEntryId: 31 }] };
  const editor = viewer(true, true, true);
  const marker = viewer(false, false, true);

  it.each<[string, ActViewer, ActDetailsPane | null, ActDetailsAccess]>([
    ['sends a cast member to the hub', viewer(false, false, false), null, 'hub'],
    [
      'sends a cast member on a pane to the hub',
      viewer(false, false, false),
      { kind: 'settings' },
      'hub',
    ],
    ['opens the details without a pane', marker, null, 'open'],
    ['opens the settings to a settings editor', editor, { kind: 'settings' }, 'open'],
    ['keeps the settings closed for others', marker, { kind: 'settings' }, 'details'],
    ['opens a known evening to a studio editor', editor, { kind: 'evening', eventId: 8 }, 'open'],
    ['keeps an evening closed for others', marker, { kind: 'evening', eventId: 8 }, 'details'],
    ['falls back from an unknown evening', editor, { kind: 'evening', eventId: 9 }, 'details'],
    ['opens a known roll call', marker, { kind: 'roll', trainingId: 31 }, 'open'],
    ['falls back from an unknown training', marker, { kind: 'roll', trainingId: 32 }, 'details'],
  ])('%s', (_case, shown, pane, expected) => {
    expect(actDetailsAccessOf(shown, studio, pane)).toBe(expected);
  });

  it('falls back from an evening of an act without a studio', () => {
    expect(actDetailsAccessOf(editor, null, { kind: 'evening', eventId: 8 })).toBe('details');
  });
});
