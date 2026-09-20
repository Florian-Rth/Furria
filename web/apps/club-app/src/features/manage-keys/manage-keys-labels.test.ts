import { describe, expect, it } from 'vitest';
import {
  findKeyHolding,
  partitionKeyHoldings,
  partitionKeyVenues,
  toHandoutConsequence,
  toHoldingPeriodLabel,
  toManagedKeysIntro,
  toReturnConsequence,
  toReturnFacts,
  toVenueEmptyCopy,
  toVenueHolderMeta,
} from './manage-keys-labels';
import type { KeyHolding, KeyVenue } from './schemas';

const holding = (overrides: Partial<KeyHolding>): KeyHolding => ({
  keyHoldingId: 1,
  personId: 1,
  firstName: 'Anna',
  lastName: 'Kaiser',
  sinceOn: '2024-03-01',
  untilOn: null,
  ...overrides,
});

const venue = (overrides: Partial<KeyVenue>): KeyVenue => ({
  venueId: 1,
  name: 'Requisitenlager',
  archivedOn: null,
  holdings: [],
  ...overrides,
});

const ANNA = holding({ keyHoldingId: 1, personId: 1 });
const MAIK = holding({
  keyHoldingId: 2,
  personId: 2,
  firstName: 'Maik',
  lastName: 'Perlberg',
  sinceOn: '2019-02-01',
  untilOn: '2022-06-30',
});
const BEA = holding({ keyHoldingId: 3, personId: 3, firstName: 'Bea', lastName: 'Kessler' });

const LAGER = venue({ venueId: 1, name: 'Requisitenlager', holdings: [ANNA, MAIK] });
const HALLE = venue({ venueId: 4, name: 'Turnhalle', holdings: [BEA] });
const LEER = venue({ venueId: 7, name: 'Vereinsraum' });
const ALTES_LAGER = venue({ venueId: 9, name: 'Altes Lager', archivedOn: '2021-01-01' });

const idsOf = (holdings: readonly KeyHolding[]): number[] =>
  holdings.map((found) => found.keyHoldingId);

describe('partitionKeyHoldings', () => {
  it('keeps the open Schlüssel apart from the returned ones', () => {
    const partition = partitionKeyHoldings([ANNA, MAIK, BEA]);

    expect(idsOf(partition.running)).toEqual([1, 3]);
    expect(idsOf(partition.ended)).toEqual([2]);
  });

  it('counts a Schlüssel as returned the moment it carries a last day', () => {
    expect(idsOf(partitionKeyHoldings([holding({ untilOn: '2099-12-31' })]).ended)).toEqual([1]);
  });

  it('reports two empty banks for an Ort nobody ever held a Schlüssel for', () => {
    const partition = partitionKeyHoldings([]);

    expect(partition.running).toEqual([]);
    expect(partition.ended).toEqual([]);
  });
});

describe('partitionKeyVenues', () => {
  it('keeps running Orte apart from archived ones in the order they arrived', () => {
    const partition = partitionKeyVenues([LAGER, ALTES_LAGER, HALLE]);

    expect(partition.running.map((found) => found.venueId)).toEqual([1, 4]);
    expect(partition.archived.map((found) => found.venueId)).toEqual([9]);
  });

  it('puts every Ort into the archived bank when none is running', () => {
    expect(partitionKeyVenues([ALTES_LAGER]).running).toEqual([]);
  });
});

describe('toHoldingPeriodLabel', () => {
  it('opens the period for a Schlüssel that is still out', () => {
    expect(toHoldingPeriodLabel(ANNA)).toBe('seit 01.03.2024');
  });

  it('spans both ends for a Schlüssel that came back', () => {
    expect(toHoldingPeriodLabel(MAIK)).toContain('01.02.2019');
    expect(toHoldingPeriodLabel(MAIK)).toContain('30.06.2022');
  });
});

describe('findKeyHolding', () => {
  it('finds nothing when no Schlüssel is targeted', () => {
    expect(findKeyHolding([LAGER, HALLE], null)).toBeNull();
  });

  it('finds nothing for an unknown Schlüssel', () => {
    expect(findKeyHolding([LAGER, HALLE], 999)).toBeNull();
  });

  it('carries the Ort the found Schlüssel belongs to', () => {
    const target = findKeyHolding([LAGER, HALLE], 3);

    expect(target?.venue.venueId).toBe(4);
    expect(target?.holding.keyHoldingId).toBe(3);
  });
});

describe('toManagedKeysIntro', () => {
  it('names the missing Orte rather than counting zero Schlüssel', () => {
    expect(toManagedKeysIntro([])).toContain('kein Ort');
  });

  it('reports that nothing is out when every Schlüssel came back', () => {
    expect(toManagedKeysIntro([venue({ holdings: [MAIK] }), LEER])).toBe(
      'Gerade ist kein Schlüssel ausgegeben.',
    );
  });

  it('uses the singular and names no Ort for a single running Schlüssel', () => {
    expect(toManagedKeysIntro([HALLE])).toBe('Ein Schlüssel ist ausgegeben.');
  });

  it('counts only the Orte that actually have a Schlüssel out', () => {
    expect(toManagedKeysIntro([LAGER, HALLE, LEER])).toBe(
      '2 Schlüssel sind für 2 Orte ausgegeben.',
    );
  });

  it('uses the singular Ort when both running Schlüssel hang at one', () => {
    expect(toManagedKeysIntro([venue({ holdings: [ANNA, BEA] }), LEER])).toBe(
      '2 Schlüssel sind für einen Ort ausgegeben.',
    );
  });
});

describe('toVenueHolderMeta', () => {
  it('names no Schlüssel when every one came back', () => {
    expect(toVenueHolderMeta([MAIK])).toBe('kein Schlüssel');
  });

  it('counts only the Schlüssel that are still out', () => {
    expect(toVenueHolderMeta([ANNA, MAIK])).toBe('1 Schlüssel');
    expect(toVenueHolderMeta([ANNA, BEA, MAIK])).toBe('2 Schlüssel');
  });
});

describe('toVenueEmptyCopy', () => {
  it('separates an Ort that never had a Schlüssel from one whose Schlüssel came back', () => {
    expect(toVenueEmptyCopy([]).title).not.toBe(toVenueEmptyCopy([MAIK]).title);
  });

  it('points at the history once there is one', () => {
    expect(toVenueEmptyCopy([MAIK]).description).toContain('unten');
  });
});

describe('toHandoutConsequence', () => {
  it('speaks of a Schlüssel that is already out', () => {
    expect(toHandoutConsequence('Anna Kaiser', 'Turnhalle', '2026-09-20', '2026-09-20')).toContain(
      'ab dem 20.09.2026',
    );
  });

  it('marks a handout dated ahead as not yet in force', () => {
    expect(toHandoutConsequence('Anna Kaiser', 'Turnhalle', '2026-11-11', '2026-09-20')).toContain(
      'vorher nicht',
    );
  });
});

describe('toReturnConsequence', () => {
  it('states the last day in the present when it is today', () => {
    expect(toReturnConsequence('Anna', 'Turnhalle', '2026-09-20', '2026-09-20')).toContain(
      'ist der letzte Tag',
    );
  });

  it('states the last day in the future when it is dated ahead', () => {
    expect(toReturnConsequence('Anna', 'Turnhalle', '2026-11-11', '2026-09-20')).toContain(
      'wird der letzte Tag',
    );
  });
});

describe('toReturnFacts', () => {
  it('leaves the last day open until one is picked', () => {
    expect(toReturnFacts(ANNA, 'Requisitenlager', null).map((fact) => fact.value)).toEqual([
      'Anna Kaiser',
      'Requisitenlager',
      '01.03.2024',
      'noch offen',
    ]);
  });

  it('carries the picked last day', () => {
    expect(toReturnFacts(ANNA, 'Requisitenlager', '2026-09-20')[3]?.value).toBe('20.09.2026');
  });
});
