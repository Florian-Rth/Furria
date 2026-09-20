import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { CalendarPage } from '@/features/calendar';
import { RequirePermission } from '@/features/session';
import { PERMISSION_KEYS } from '@/lib/api/schemas';

const CalendarRoute: FC = () => (
  <RequirePermission permissionKey={PERMISSION_KEYS.clubRead}>
    <CalendarPage />
  </RequirePermission>
);

export const Route = createFileRoute('/_app/calendar')({ component: CalendarRoute });
