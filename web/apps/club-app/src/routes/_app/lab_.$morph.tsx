import { createFileRoute, notFound } from '@tanstack/react-router';
import type { FC } from 'react';
import { labMorphOf, MorphStagePage } from '@/features/lab';

const LabMorphRoute: FC = () => {
  const { morph } = Route.useLoaderData();

  return <MorphStagePage morph={morph} />;
};

export const Route = createFileRoute('/_app/lab_/$morph')({
  loader: ({ params }) => {
    const morph = labMorphOf(params.morph);

    if (morph === null) {
      throw notFound();
    }

    return { morph };
  },
  component: LabMorphRoute,
});
