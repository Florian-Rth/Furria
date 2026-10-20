import type { FC } from 'react';
import { KkButton } from '../../../KkButton';
import type { KkIconName } from '../../../KkIcon';
import { KkIcon } from '../../../KkIcon';
import type { KkSx } from '../../../kk-sx';

interface KkCalendarAgendaMoreProps {
  label: string;
  icon: KkIconName;
  busy: boolean;
  onSelect: () => void;
  sx?: KkSx;
}

export const KkCalendarAgendaMore: FC<KkCalendarAgendaMoreProps> = ({
  label,
  icon,
  busy,
  onSelect,
  sx,
}) => (
  <KkButton
    variant="text"
    size="small"
    loading={busy}
    onClick={onSelect}
    startIcon={<KkIcon name={icon} size="small" />}
    sx={[{ alignSelf: 'flex-start' }, ...(Array.isArray(sx) ? sx : [sx])]}
  >
    {label}
  </KkButton>
);
