import { createFileRoute } from '@tanstack/react-router';

const NoPane = (): null => null;

export const Route = createFileRoute('/_app/manage/beer-list/')({
  component: NoPane,
});
