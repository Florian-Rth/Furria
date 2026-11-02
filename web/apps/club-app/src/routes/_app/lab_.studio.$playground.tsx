import { createFileRoute, notFound } from '@tanstack/react-router';
import type { FC } from 'react';
import { StudioLabPage } from '@/features/studio-lab/components/StudioLabPage';
import { StudioLabSearchSchema } from '@/features/studio-lab/schemas';
import { studioLabEntryOf } from '@/features/studio-lab/studio-lab';

const StudioLabRoute: FC = () => {
  const { entry } = Route.useLoaderData();
  const search = Route.useSearch();

  return <StudioLabPage entry={entry} search={search} />;
};

export const Route = createFileRoute('/_app/lab_/studio/$playground')({
  validateSearch: StudioLabSearchSchema,
  loader: ({ params }) => {
    const entry = studioLabEntryOf(params.playground);

    if (entry === null) {
      throw notFound();
    }

    return { entry };
  },
  component: StudioLabRoute,
});
