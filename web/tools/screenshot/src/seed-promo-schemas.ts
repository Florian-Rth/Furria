import { z } from 'zod';

export const SessionRecordsSchema = z.object({
  sessions: z.array(z.object({ sessionId: z.number().int(), startYear: z.number().int() })),
});
export const CreatedSessionRecordSchema = z.object({ sessionId: z.number().int() });

export const EventsSchema = z.object({
  events: z.array(
    z.object({
      eventId: z.number().int(),
      title: z.string(),
      publishedAt: z.string().nullable(),
      picture: z.object({}).loose().nullable(),
      isOver: z.boolean(),
    }),
  ),
});
export type EventSummary = z.infer<typeof EventsSchema>['events'][number];
export const CreatedEventSchema = z.object({ eventId: z.number().int() });

export const ActsSchema = z.object({
  acts: z.array(z.object({ actId: z.number().int(), name: z.string(), archived: z.boolean() })),
});
export const CreatedActSchema = z.object({ actId: z.number().int() });

const MediaStateSchema = z.enum(['processing', 'ready', 'failed']);

export const StudioSchema = z.object({
  studio: z
    .object({
      songs: z.array(
        z.object({
          songId: z.number().int(),
          mediaItemId: z.number().int(),
          state: MediaStateSchema,
          durationSeconds: z.number().nullable(),
          firstBeatSeconds: z.number().nullable(),
          tempoBpm: z.number().nullable(),
        }),
      ),
      steps: z.array(
        z.object({ stepId: z.number().int(), name: z.string(), startSeconds: z.number() }),
      ),
      parts: z.array(z.object({ partId: z.number().int(), name: z.string() })),
      spots: z.array(
        z.object({
          spotId: z.number().int(),
          number: z.number().int(),
          person: z.object({ personId: z.number().int() }).nullable(),
        }),
      ),
      choreography: z
        .object({
          version: z.number().int(),
          tracks: z.array(
            z.object({
              spotId: z.number().int(),
              keyframes: z.array(
                z.object({
                  seconds: z.number(),
                  position: z.object({ rightMetres: z.number(), backMetres: z.number() }),
                }),
              ),
            }),
          ),
        })
        .nullable(),
      trainings: z.array(
        z.object({ calendarEntryId: z.number().int(), title: z.string(), startsAt: z.string() }),
      ),
    })
    .nullable(),
});
export type Studio = NonNullable<z.infer<typeof StudioSchema>['studio']>;

export const CreatedSongSchema = z.object({ songId: z.number().int() });
export const CreatedStepsSchema = z.object({ stepIds: z.array(z.number().int()) });
export const CreatedPartSchema = z.object({ partId: z.number().int() });
export const CreatedSpotSchema = z.object({ spotId: z.number().int(), number: z.number().int() });
export const ChoreographyVersionSchema = z.object({ version: z.number().int() });

export const RunningOrderSchema = z.object({
  version: z.number().int(),
  confirmedAt: z.string().nullable(),
  changedSinceConfirmed: z.boolean(),
  lines: z.array(
    z.object({ act: z.object({ actId: z.number().int() }), position: z.number().int().nullable() }),
  ),
  findings: z.array(z.object({ kind: z.string(), severity: z.enum(['conflict', 'hint']) })),
});
export type RunningOrder = z.infer<typeof RunningOrderSchema>;

export const HallsSchema = z.object({
  halls: z.array(
    z.object({ hallId: z.number().int(), venueId: z.number().int(), name: z.string() }),
  ),
});
export const HallSchema = z.object({ version: z.number().int() });
export const CreatedHallSchema = z.object({ hallId: z.number().int() });

export const SeatingSchema = z.object({
  tableTypes: z.array(z.object({ tableTypeId: z.number().int(), name: z.string() })),
});

export const TablePlanSchema = z.object({
  version: z.number().int(),
  document: z.object({ rows: z.array(z.object({}).loose()) }),
});
export const TablePlanVersionSchema = z.object({ version: z.number().int() });

export const NewsSchema = z.object({
  sections: z.array(
    z.object({
      posts: z.array(
        z.object({
          newsPostId: z.number().int(),
          title: z.string(),
          state: z.enum(['draft', 'published', 'withdrawn']),
        }),
      ),
    }),
  ),
});
export const CreatedNewsPostSchema = z.object({ newsPostId: z.number().int() });
