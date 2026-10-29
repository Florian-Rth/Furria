import { describe, expect, it } from 'vitest';
import type { EventDetail } from '@/lib/public-events/schemas';
import type { PresalePlacesView } from './presale-places-display';
import { derivePresalePlaces } from './presale-places-display';

type PresaleFacts = Pick<EventDetail, 'status' | 'presaleStartsAt' | 'presalePlaces'>;

describe('derivePresalePlaces', () => {
  it.each<[PresaleFacts, PresalePlacesView | null]>([
    [{ status: 'available', presaleStartsAt: '2026-11-11T11:11', presalePlaces: [] }, null],
    [
      {
        status: 'presaleScheduled',
        presaleStartsAt: '2026-11-11T11:11',
        presalePlaces: [
          { name: 'Bäckerei Ott', street: '', zip: '', city: '', hint: null, openingHours: [] },
        ],
      },
      {
        opensAt: '2026-11-11T11:11',
        places: [{ name: 'Bäckerei Ott', address: null, hint: null, openingHours: [] }],
      },
    ],
    [
      {
        status: 'fewLeft',
        presaleStartsAt: '2026-11-11T11:11',
        presalePlaces: [
          {
            name: 'Sparkasse',
            street: 'Hauptstraße 1',
            zip: '79111',
            city: 'Freiburg',
            hint: 'Am Schalter',
            openingHours: [
              { weekday: 'monday', opens: '09:00:00', closes: '12:00:00' },
              { weekday: 'tuesday', opens: '09:00:00', closes: '12:00:00' },
              { weekday: 'wednesday', opens: '09:00:00', closes: '12:00:00' },
              { weekday: 'saturday', opens: '09:30:00', closes: '13:00:00' },
            ],
          },
        ],
      },
      {
        opensAt: null,
        places: [
          {
            name: 'Sparkasse',
            address: 'Hauptstraße 1, 79111 Freiburg',
            hint: 'Am Schalter',
            openingHours: [
              { days: 'Mo–Mi', times: '9–12 Uhr' },
              { days: 'Sa', times: '9:30–13 Uhr' },
            ],
          },
        ],
      },
    ],
  ])('shows the places of %j', (event, view) => {
    expect(derivePresalePlaces(event)).toEqual(view);
  });
});
