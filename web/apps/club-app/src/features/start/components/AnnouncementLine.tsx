import { KkAvatar, KkDensePanel } from '@furria/ui';
import type { FC } from 'react';
import type { AnnouncementRow } from '../hooks/use-announcements-panel';

interface AnnouncementLineProps {
  row: AnnouncementRow;
}

export const AnnouncementLine: FC<AnnouncementLineProps> = ({ row }) => {
  const { line } = row;
  const face = <KkAvatar initials={line.initials} source={line.portrait} size="small" />;
  const day = <KkDensePanel.Aside text={line.day} />;

  return (
    <KkDensePanel.Line
      anchor={face}
      title={line.title}
      meta={row.meta}
      trailing={day}
      state={row.state}
      accessibleLabel={line.accessibleName}
      onClick={row.open}
    />
  );
};
