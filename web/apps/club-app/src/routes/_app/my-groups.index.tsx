import { createFileRoute, redirect } from '@tanstack/react-router';

const GROUPS_PATH = '/groups';

export const Route = createFileRoute('/_app/my-groups/')({
  beforeLoad: () => {
    throw redirect({ to: GROUPS_PATH });
  },
});
