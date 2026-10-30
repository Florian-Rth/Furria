import { createFileRoute, notFound } from '@tanstack/react-router';
import type { FC } from 'react';
import { HallLabPage } from '@/features/lab-hall/components/HallLabPage';
import { hallVariantOf } from '@/features/lab-hall/hall-variants';
import { HallSearchSchema } from '@/features/lab-hall/schemas';

const HallLabRoute: FC = () => {
  const { actId } = Route.useParams();
  const { variant } = Route.useLoaderData();
  const search = Route.useSearch();

  return <HallLabPage actId={actId} variant={variant} search={search} />;
};

export const Route = createFileRoute('/_app/lab_/hall/$variant/$actId')({
  validateSearch: HallSearchSchema,
  loader: ({ params }) => {
    const variant = hallVariantOf(params.variant);

    if (variant === null) {
      throw notFound();
    }

    return { variant };
  },
  component: HallLabRoute,
});
