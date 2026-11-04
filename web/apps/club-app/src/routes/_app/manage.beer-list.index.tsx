import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';

const NoPane: FC = () => null;

export const Route = createFileRoute('/_app/manage/beer-list/')({
  component: NoPane,
});
