import { createFileRoute, notFound } from '@tanstack/react-router';
import type { FC } from 'react';
import { WelcomeLabPage } from '@/features/welcome/components/WelcomeLabPage';
import { welcomeLabCaseOf } from '@/features/welcome/welcome-lab';

const WelcomeLabRoute: FC = () => {
  const { labCase } = Route.useLoaderData();

  return <WelcomeLabPage key={labCase.slug} labCase={labCase} />;
};

export const Route = createFileRoute('/_app/lab_/welcome/$case')({
  loader: ({ params }) => {
    const labCase = welcomeLabCaseOf(params.case);

    if (labCase === null) {
      throw notFound();
    }

    return { labCase };
  },
  component: WelcomeLabRoute,
});
