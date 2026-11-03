import type { ActStudio } from '@/features/acts/schemas';

export interface HoldsStudio {
  studio: ActStudio | null;
}

export const withStudio = <TResponse extends HoldsStudio>(
  response: TResponse | undefined,
  change: (studio: ActStudio) => ActStudio,
): TResponse | undefined =>
  response === undefined || response.studio === null
    ? response
    : { ...response, studio: change(response.studio) };
