import { createFileRoute, notFound } from '@tanstack/react-router';
import type { FC } from 'react';
import { labMorphOf, MorphPresidentPage } from '@/features/lab';

const LabMorphRoute: FC = () => {
  const { morph } = Route.useLoaderData();

  return <MorphPresidentPage morph={morph} />;
};

export const Route = createFileRoute('/_app/lab_/$morph_/elferrat_/praesident')({
  loader: ({ params }) => {
    const morph = labMorphOf(params.morph);

    if (morph === null) {
      throw notFound();
    }

    return { morph };
  },
  component: LabMorphRoute,
});
