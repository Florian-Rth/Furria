import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { hubLabChoices, hubSearchOf } from '@/features/lab-beer-a/beer-a-lab';
import { BeerHubAPage } from '@/features/lab-beer-a/components/BeerHubAPage';
import { BeerAHubSearchSchema } from '@/features/lab-beer-a/schemas';

const BeerHubARoute: FC = () => {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const viewer = search.as ?? 'owner';
  const switchLab = (choice: string): void => {
    void navigate({ search: hubSearchOf(choice), replace: true });
  };

  return (
    <BeerHubAPage key={viewer} viewer={viewer} labChoices={hubLabChoices} onLabChange={switchLab} />
  );
};

export const Route = createFileRoute('/_app/lab_/beer-hub-a')({
  validateSearch: BeerAHubSearchSchema,
  component: BeerHubARoute,
});
