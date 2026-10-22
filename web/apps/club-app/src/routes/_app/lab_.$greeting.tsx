import { createFileRoute, notFound } from '@tanstack/react-router';
import type { FC } from 'react';
import { GreetingLabPage } from '@/features/lab/components/GreetingLabPage';
import { labGreetingOf } from '@/features/lab/lab-greetings';

const GreetingLabRoute: FC = () => {
  const { greeting } = Route.useLoaderData();

  return <GreetingLabPage greeting={greeting} />;
};

export const Route = createFileRoute('/_app/lab_/$greeting')({
  loader: ({ params }) => {
    const greeting = labGreetingOf(params.greeting);

    if (greeting === null) {
      throw notFound();
    }

    return { greeting };
  },
  component: GreetingLabRoute,
});
